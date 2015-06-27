/**
 * Created by lyt9304 on 15/5/31.
 */
var io = require('socket.io')();

//在线用户
var onlineUsers = {};

//当前在线人数
var onlineCount = 0;

var readyUsers={};
var readyCount=0;


var we=10;//canvas可以容下的宽度的数量和长度的数量
var he=10;

var draww=32;//画到canvas上的宽和高
var drawh=32;


var gameMap={
    "1":[
        1,1,1,1,1,1,1,1,1,1,
        1,0,0,0,0,0,0,0,0,1,
        1,0,0,2,0,2,0,2,0,1,
        1,0,0,2,0,2,2,0,0,1,
        1,0,2,0,0,0,0,2,0,1,
        1,0,0,0,2,0,2,2,0,1,
        1,0,2,0,0,0,2,0,0,1,
        1,0,0,2,0,2,0,2,0,1,
        1,0,0,0,0,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1,1
    ]
};

var map=[];
var tankData={};

var tolerance=3;//偏差2px,不然碰撞检测有些太狭窄过不去
var tankSpd=5;
var fireSpd=1.5;


//碰撞检测
function checkField(x,y){
    console.log(map[Math.floor(x/draww)*we+Math.floor(y/drawh)]);
    if(map[Math.floor(y/drawh)*we+Math.floor(x/draww)] == 0){
        return true;
    }
    else{
        return false;
    }
}

function printMap(x,y,map){
    for(var i=0;i<x;i++){
        var colStr="";
        for(var j=0;j<y;j++){
           colStr+=map[i*he+j]+",";
        }
        console.log(colStr);
    }
}

io.on('connection', function(socket){
    console.log('a user connected');

    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.username;

        //检查在线列表，如果不在里面就加入
        if(!onlineUsers.hasOwnProperty(obj.username)) {
            onlineUsers[obj.username] = obj.username;
            //在线人数+1
            onlineCount++;
        }

        //向所有客户端广播用户加入
        io.emit('login', {onlineCount:onlineCount,readyCount:readyCount,user:obj});
        console.log(obj.username+'加入了游戏');
    });


    socket.on('ready',function(obj){
        console.log(obj.username+'准备就绪');
        if(!readyUsers.hasOwnProperty(obj.username)){
            readyUsers[obj.username]=obj.username;
            readyCount++;
        }
        console.log(readyCount);

        //判断是否符合游戏开始条件:所有人都准备，并且准备人数大于等于两人
        if(readyCount==onlineCount && readyCount>=2){
            //遍历readyUser生成一些初始数据
            map=gameMap[1];
            for(var item in readyUsers){
                var x, y, fwd;
                do{
                    x = Math.floor(Math.random()*(we-1)+1);//[1,we-1]
                    y = Math.floor(Math.random()*(he-1)+1);
                }
                while(map[y*we+x]!=0);

                //map[y*we+x]=3;

                //变换到实际坐标位置
                x=x*draww;
                y=y*drawh;

                fwd=Math.floor(Math.random()*4+0);//[0,4]

                spd=tankSpd;
                tankData[item]=[x,y,fwd,spd];
            }

            console.log(readyUsers);
            console.log(tankData);
            printMap(10,10,map);

            //传输一些初始化数据，地图和出生点
            io.emit('start',{startData:tankData,map:map});
        }
        io.emit('ready',{readyCount:readyCount,user:obj});

    });

    socket.on("move",function(obj){
        x=tankData[obj.username][0];
        y=tankData[obj.username][1];
        fwd=tankData[obj.username][2];
        spd=tankData[obj.username][3];

        switch (obj.keycode){
            case 37://left
                if(checkField(x-spd+tolerance,y+tolerance)){
                    fwd=2;
                    x-=spd;
                }
                break;
            case 38://up
                if(checkField(x+tolerance,y-spd+tolerance)){
                    fwd=0;
                    y-=spd;
                }
                break;
            case 39://right
                if(checkField(x+spd+draww-tolerance,y+tolerance)){
                    fwd=3;
                    x+=spd;
                }
                break;
            case 40://down
                if(checkField(x+tolerance,y+spd+drawh-tolerance)){
                    fwd=1;
                    y+=spd;
                }
                break;
            //case 32://space fire
            //    //生成一个炮弹，放到维护的数组
            //    var fireEnt = new fireObj();
            //    //根据坦克方向生成对应方向和位置的炮弹
            //    switch (fwd){
            //        case 0://up
            //            fireEnt.init(x,y-drawh/2,0);
            //            break;
            //        case 1://down
            //            fireEnt.init(x,y+drawh/2,1);
            //            break;
            //        case 2://left
            //            fireEnt.init(x-draww/2,y,2);
            //            break;
            //        case 3://right
            //            fireEnt.init(x+draww/2,y,3);
            //            break;
            //        default:break;
            //    }
            //    fireArr.push(fireEnt);
            //    updateGameView();
            //    break;
            default:
                break;
        }

        tankData[obj.username][0]=x;
        tankData[obj.username][1]=y;
        tankData[obj.username][2]=fwd;
        tankData[obj.username][3]=spd;

        io.emit('move',{nowData:tankData,map:map});
    });

    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid:socket.name, username:onlineUsers[socket.name]};

            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;

            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
            console.log(obj.username+'退出了');
        }
    });

});

exports.listen = function (_server) {
    return io.listen(_server);
};