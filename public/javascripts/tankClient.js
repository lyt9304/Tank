/**
 * Created by lyt9304 on 15/5/31.
 */
(function () {

    window.gameCommon = {

        //用户信息
        username:null,

        //服务器信息
        socket:null,

        logout:function(){
            //this.socket.disconnect();
            location.reload();
        },

        //第一个界面用户提交用户名
        usernameSubmit:function(){
            var username = $("#username").val();
            if(username != ""){
                $("#username").val("");
                $("#loginbox").hide();
                $("#playbox").show();
                this.init(username);
            }
            return false;
        },
        ready:function(){
            this.socket.emit('ready',{username:this.username});
        },
        initGame:function(){
            canvas=document.getElementById("gameCanvas");
            content=canvas.getContext("2d");

            w=canvas.width;
            h=canvas.height;

            for(var item in gamingTank){
                //根据初始信息在本地新建好坦克对象,tankMap:id-obj
                var tankEnt=new tankObj();
                tankEnt.init(item,gamingTank[item][0],gamingTank[item][1],gamingTank[item][2],gamingTank[item][3]);
                tankMap[item]=tankEnt;
                if(item == currentUser){
                    currentTank=tankMap[item];
                }
            }
            console.log(tankMap);
            console.log(currentTank);
        },

        drawBackground:function(){
            content.fillStyle="black";
            content.fillRect(0,0,w,h);
        },

        drawWall:function(cx,cy){
            content.drawImage(AllPic,wallStartx,wallStarty,cutw,cuth,cx,cy,draww,drawh);
        },

        drawBox:function(cx,cy){
            content.drawImage(AllPic,boxStartx,boxStarty,cutw,cuth,cx,cy,draww,drawh);
        },

        drawMap:function(gameMap){
            for(var i=0;i<he;i++){
                for(var j=0;j<we;j++){
                    var mapItem=gameMap[i*we+j];
                    switch(mapItem){
                        case 0:break;
                        case 1:gameCommon.drawWall(j*draww,i*drawh);break;
                        case 2:gameCommon.drawBox(j*draww,i*drawh);break;
                        case 3:break;
                        default:break;
                    }
                }
            }
        },

        updateGameView:function(){
            //Step1:Background;
            gameCommon.drawBackground();

            //Step2:UpdatedGamingMap;
            gameCommon.drawMap(gamingMap);

            //Step3:UpdatedTankObjs;(fwd,move);
            for(var item in tankMap){
                //console.log(item);
                tankMap[item].draw();
            }

            //console.log("after draw");

            //Step4:Fire;
            for(var i=0;i<fireArr.length;i++) {
                fireArr[i].move(fireArr[i].fwd);
                fireMap[i] = [fireArr[i].x, fireArr[i].y, fireArr[i].fwd, fireArr.shooter];
            }

            gameCommon.socket.emit("firemove", {fireMap:fireMap,len:fireArr.length});



            //Step5:OtherEvent:destroy;
        },
        init:function(username){
            this.username = username;

            $("#showusername").html(this.username);

            //连接websocket后端服务器
            this.socket = io.connect('localhost:3000');

            //告诉服务器端有用户登录
            this.socket.emit('login', {username:this.username});

            //收到有用户加入信息
            this.socket.on('login',function(_obj){
                $("#allUserCnt").text(_obj.onlineCount);
                $("#readyUserCnt").text(_obj.readyCount);
            });

            this.socket.on('ready',function(_obj){
               $("#readyUserCnt").text(_obj.readyCount);
            });

            this.socket.on('start', function (_obj) {
                gameStartFlag=true;
                console.log("gameStartFlag=true");
                $("waiting-msg").hide();


                currentUser=username;
                gamingMap=_obj.map;
                gamingTank=_obj.startData;

                gameCommon.initGame();
                gameCommon.updateGameView();
            });

            //监听键盘事件
            //37:left 38:up 39:right 40:down space:32
            document.onkeydown=function(e){
                if(gameStartFlag==false){
                    return;
                }
                e = event || window.event || arguments.callee.caller.arguments[0];
                //console.log("key:"+ e.keyCode);

                gameCommon.socket.emit('move',{username:username,keycode:e.keyCode});
            };

            this.socket.on('move',function(_obj){

                //console.log("in client");
                //console.log(_obj);

                gamingMap=_obj.map;
                gamingTank=_obj.nowData;

                for(var item in gamingTank){
                    tankMap[item].update(item,gamingTank[item][0],gamingTank[item][1],gamingTank[item][2],gamingTank[item][3]);
                }
                gameCommon.updateGameView();
            });

            this.socket.on('newfire',function(_obj){
                var x=_obj.position[0];
                var y=_obj.position[1];
                var fwd=_obj.position[2];
                var shooter=_obj.shooter;

                //生成一个炮弹，放到维护的数组
                var fireEnt = new fireObj();
                //根据坦克方向生成对应方向和位置的炮弹
                switch (fwd){
                    case 0://up
                        fireEnt.init(x,y-drawh/2,0,shooter);
                        break;
                    case 1://down
                        fireEnt.init(x,y+drawh/2,1,shooter);
                        break;
                    case 2://left
                        fireEnt.init(x-draww/2,y,2,shooter);
                        break;
                    case 3://right
                        fireEnt.init(x+draww/2,y,3,shooter);
                        break;
                    default:break;
                }
                fireArr.push(fireEnt);
                gameCommon.updateGameView();
            });



            this.socket.on('hittank',function(_obj){

                var _fireIdx=_obj.fireIdx;
                var _tankId=_obj.tankId;

                console.log("in tankdestroy:"+fireArr[_fireIdx]+" hit "+_tankId);

                delete tankMap[tankId];
                fireArr[_fireIdx].destroy(fireArr[_fireIdx].x,fireArr[_fireIdx].y,fireArr[_fireIdx].fwd);
                fireArr.splice(_fireIdx,1);

                if(tankId==currentUser){
                    alert("你已经输了！");
                    return;
                }

                if(fireArr[_fireIdx]==currentUser){
                    alert("你击败了"+tankId+"!");
                    return;
                }
            });

            this.socket.on('hitbox',function(_obj){

            });

            this.socket.on('hitwall',function(_obj){

            });


        }
    };
})();


