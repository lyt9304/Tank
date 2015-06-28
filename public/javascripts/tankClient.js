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

                initGame();
                updateGameView();
            });

            //监听键盘事件
            //37:left 38:up 39:right 40:down space:32
            document.onkeydown=function(e){
                if(gameStartFlag==false){
                    return;
                }
                e = event || window.event || arguments.callee.caller.arguments[0];
                console.log("key:"+ e.keyCode);

                gameCommon.socket.emit('move',{username:username,keycode:e.keyCode});
            };

            this.socket.on('move',function(_obj){

                console.log("in client");
                console.log(_obj);

                gamingMap=_obj.map;
                gamingTank=_obj.nowData;

                for(var item in gamingTank){
                    tankMap[item].update(item,gamingTank[item][0],gamingTank[item][1],gamingTank[item][2],gamingTank[item][3]);
                    if(item == currentUser){
                        currentTank=tankMap[item];
                    }
                }
                updateGameView();
            });

            this.socket.on('newfire',function(_obj){
                var x=_obj.position[0];
                var y=_obj.position[1];
                var fwd=_obj.position[2];

                //生成一个炮弹，放到维护的数组
                var fireEnt = new fireObj();
                //根据坦克方向生成对应方向和位置的炮弹
                console.log(x/draww,y/drawh);
                switch (fwd){
                    case 0://up
                        fireEnt.init(x,y-drawh/2,0);
                        break;
                    case 1://down
                        fireEnt.init(x,y+drawh/2,1);
                        break;
                    case 2://left
                        fireEnt.init(x-draww/2,y,2);
                        break;
                    case 3://right
                        fireEnt.init(x+draww/2,y,3);
                        break;
                    default:break;
                }
                fireArr.push(fireEnt);
                updateGameView();
            });
        }
    };

})();


