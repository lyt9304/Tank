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

        registerSubmit:function(){
            var user=$("#reg-username").val();
            var password=$("#reg-password").val();

            this.socket = io.connect('localhost:3000');

            if(password && user){

                this.socket.emit("register",{user:user,pw:password});
                this.socket.on("registersuccess",function(_obj){
                    if(_obj.user==user){
                        alert("注册成功！");
                        location.reload();
                    }else{
                        return;
                    }
                });
                this.socket.on("dupregister",function(_obj){
                    if(_obj.user==user){
                        alert("用户名已存在！");
                    }else{
                        return;
                    }
                })
            }
            else{
                alert("请输入用户名和密码！");
            }
        },

        //第一个界面用户提交用户名
        usernameSubmit:function(){
            var user = $("#username").val();
            var password = $("#password").val();

            //连接websocket后端服务器
            this.socket = io.connect('localhost:3000');

            //告诉服务器端有用户登录
            if(user && password){
                this.socket.emit('login', {username:user,password:password});
            }
            else{
                alert("请输入用户名和密码！");
            }


            //收到有用户加入信息
            this.socket.on('login',function(_obj){
                if(_obj.user==user){
                    $("#username").val("");
                    $("#loginbox").hide();
                    $("#dialog-register").hide();
                    $("#playbox").show();
                    gameCommon.init(user);
                }
                $("#allUserCnt").text(_obj.onlineCount);
                $("#readyUserCnt").text(_obj.readyCount);
                gameCommon.updateSortPoint(_obj.sortResult);
            });

            this.socket.on('nouser',function(_obj){
                if(_obj.user==user){
                    alert("没有该用户");
                }
            });

            this.socket.on('pwwrong',function(_obj){
                alert("密码错误");
            });

            return false;
        },
        restart:function(){
            this.socket.emit('ready',{username:this.username});
            $("#game-result").hide();
            $("#waiting-msg").show();
            $("#btn-ready").hide();
            $("#btn-unready").show();
        },
        ready:function(){
            this.socket.emit('ready',{username:this.username});
            $("#btn-ready").hide();
            $("#btn-unready").show();
        },
        unready:function(){
            this.socket.emit('unready',{username:this.username});
            $("#btn-ready").show();
            $("#btn-unready").hide();
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
                if(tankMap[item].live==true){
                    tankMap[item].draw();
                }
            }

            //console.log("after draw");

            //Step4:Fire;
            for(var i=0;i<fireArr.length;i++) {
                fireArr[i].move(fireArr[i].fwd);
                fireMap[i] = [fireArr[i].x, fireArr[i].y, fireArr[i].fwd, fireArr[i].shooter];
            }

            gameCommon.socket.emit("firemove", {fireMap:fireMap,len:fireArr.length});



            //Step5:OtherEvent:destroy;
        },
        updatePoint:function(){
            $("#now-point").html("");
            var htmlstr="";
            htmlstr+="<div>得分信息</div>";
            for(var item in tankMap){
                tankMap[item].point=gamingTank[item][5];
                htmlstr+="<div>"+item+" 得分："+tankMap[item].point+"</div>";
            }
            $("#now-point").html(htmlstr);
        },
        updateSortPoint:function(arr){
            $("#high-score").html("");
            var htmlstr="";
            for(var i=0;i<10;i++){
                if(i<arr.length){
                    htmlstr+="<div>第"+(i+1)+"名："+arr[i].user+" 得分："+arr[i].score+"</div>";
                }else{
                    htmlstr+="<div>第"+(i+1)+"名：--- 得分：---</div>";
                }
            }
            $("#high-score").html(htmlstr);
        },
        init:function(username){
            this.username = username;

            $("#showusername").html(this.username);

            this.socket.on('ready',function(_obj){
               $("#readyUserCnt").text(_obj.readyCount);
            });

            this.socket.on('unready',function(_obj){
                $("#readyUserCnt").text(_obj.readyCount);
            });

            this.socket.on('start', function (_obj) {
                gameStartFlag=true;
                console.log("gameStartFlag=true");
                $("#gameCanvas").show();
                $("#waiting-msg").hide();


                currentUser=username;
                gamingMap=_obj.map;
                gamingTank=_obj.startData;

                gameCommon.initGame();
                gameCommon.updateGameView();
            });

            //监听键盘事件
            //37:left 38:up 39:right 40:down space:32
            document.onkeydown=function(e){
                console.log("gameStartFlag:"+gameStartFlag);
                if(gameStartFlag==false){
                    return;
                }
                e = event || window.event || arguments.callee.caller.arguments[0];
                //console.log("key:"+ e.keyCode);
                if(e.keyCode==37|| e.keyCode==38|| e.keyCode==39|| e.keyCode==40|| e.keyCode==32){
                    gameCommon.socket.emit('move',{username:username,keycode:e.keyCode});
                }
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

                var _shooter=fireArr[_fireIdx].shooter;

                console.log("in tankdestroy:"+fireArr[_fireIdx].shooter+" hit "+_tankId);

                tankMap[_tankId].live=false;
                fireArr[_fireIdx].destroy(fireArr[_fireIdx].x,fireArr[_fireIdx].y,fireArr[_fireIdx].fwd);
                fireArr.splice(_fireIdx,1);


                gamingTank=_obj.nowData;
                gameCommon.updatePoint();

                if(_tankId==currentUser){
                    alert("你已经输了！");
                    gameStartFlag=false;
                    $("#gameCanvas").hide();
                    return;
                }

                if(_shooter==currentUser){
                    //alert("你击败了"+_tankId+"!");
                    return;
                }
            });

            this.socket.on("end",function(_obj){
                gameStartFlag=false;
                gamingTank=_obj.nowData;
                gameCommon.updatePoint();
                gameCommon.updateSortPoint(_obj.sortResult);

                $("#gameCanvas").hide();
                $("#game-result").show();
                $("#winner").text(_obj.winner);
                $("#allUserCnt").text(_obj.onlineCount);
                $("#readyUserCnt").text(_obj.readyCount);
            });

            this.socket.on('hitbox',function(_obj){
                gamingMap=_obj.map;
                gamingTank=_obj.nowData;
                gameCommon.updatePoint();
                var _fireIdx=_obj.fireIdx;
                fireArr[_fireIdx].destroy(fireArr[_fireIdx].x,fireArr[_fireIdx].y,fireArr[_fireIdx].fwd);
                fireArr.splice(_fireIdx,1);
            });

            this.socket.on('hitwall',function(_obj){
                var _fireIdx=_obj.fireIdx;
                fireArr[_fireIdx].destroy(fireArr[_fireIdx].x,fireArr[_fireIdx].y,fireArr[_fireIdx].fwd);
                fireArr.splice(_fireIdx,1);
            });


        }
    };
})();


