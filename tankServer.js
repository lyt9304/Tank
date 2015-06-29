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
    ],
    "2":[
        1,1,1,1,1,1,1,1,1,1,
        1,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,2,0,0,0,1,
        1,0,0,0,0,0,0,0,0,1,
        1,0,2,0,0,0,0,2,0,1,
        1,0,0,0,0,0,0,0,0,1,
        1,0,2,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1,1
    ]

};


function fireCheckObj(x,y,fwd){
    switch(fwd){
        case 0: x+=draww/2; y+=draww/2-2;break; //up
        case 1: x+=draww/2; y+=draww/2+3;break; //down
        case 2: x+=draww/2-2; y+=draww/2;break; //left
        case 3: x+=draww/2+2; y+=draww/2;break; //right
        default: break;
    }
    //var coll=gamingMap[Math.floor(y/drawh)*we+Math.floor(x/draww)];
    //console.log('炮弹位置方向：',x,y,fwd);
    //console.log('映射到数组：',Math.floor(y/drawh)*we+Math.floor(x/draww));
    //console.log('地图元素：',gamingMap[Math.floor(y/drawh)*we+Math.floor(x/draww)]);
    return gamingMap[Math.floor(y/drawh)*we+Math.floor(x/draww)];
};

function fireCheckTank(x,y,shooter){
    for (var item in tankData){
        //console.log(tankData[item].id,tankData[item].x,tankData[item].y);
        if (item==shooter) {console.log("continue");continue;}
        if ((x+drawh/2)>=tankData[item][0] && (x+drawh/2)<=(tankData[item][0]+drawh)&&
            (y+draww/2)>=tankData[item][1] && (y+draww/2)<=(tankData[item][1]+draww)
            ) {
            console.log(tankData[item].id);
            return tankData[item].id;
        }
    }
    return "ok";
};

var map=[];
var tankData={};

var tolerance=3;//偏差2px,不然碰撞检测有些太狭窄过不去
var tankSpd=5;
var fireSpd=5;


//碰撞检测
function checkField(x,y){
    console.log(map[Math.floor(y/drawh)*we+Math.floor(x/draww)]);
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
            map=gameMap[2];
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
                tankData[item]=[x,y,fwd,spd,1];
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
        var x=tankData[obj.username][0];
        var y=tankData[obj.username][1];
        var fwd=tankData[obj.username][2];
        var spd=tankData[obj.username][3];

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
            case 32://space fire

                var startx=tankData[obj.username][0];
                var starty=tankData[obj.username][1];
                var fwd=tankData[obj.username][2];
                var shooter=obj.username;

                console.log("new fire:"+[startx,starty,fwd]);
                io.emit('newfire',{shooter:shooter,position:[startx,starty,fwd]});
                return;
                break;
            default:
                break;
        }

        tankData[obj.username][0]=x;
        tankData[obj.username][1]=y;
        tankData[obj.username][2]=fwd;
        tankData[obj.username][3]=spd;

        io.emit('move',{nowData:tankData,map:map});
    });


    socket.on('firemove', function (obj) {

        var _fireMap=obj.fireMap;
        var _len=obj.len;


        for(var i=0;i<_len;i++){

            var x=_fileMap[i][0];
            var y=_fileMap[i][1];
            var fwd=fileMap[i][2];
            var shooter=fileMap[i][3];

            //check Tank
            for (var item in tankData){
                //console.log(tankData[item].id,tankData[item].x,tankData[item].y);
                if (item==shooter) {console.log("continue");continue;}
                if ((x+drawh/2)>=tankData[item][0] && (x+drawh/2)<=(tankData[item][0]+drawh)&&
                    (y+draww/2)>=tankData[item][1] && (y+draww/2)<=(tankData[item][1]+draww)
                ) {
                    console.log("//check Tank")
                    console.log(item);
                    io.emit('hittank',{fireIdx:i,tankId:item});
                }
            }

            //check Obj
            switch(fwd){
                case 0: x+=draww/2; y+=draww/2-2;break; //up
                case 1: x+=draww/2; y+=draww/2+3;break; //down
                case 2: x+=draww/2-2; y+=draww/2;break; //left
                case 3: x+=draww/2+2; y+=draww/2;break; //right
                default: break;
            }

            var coll=gamingMap[Math.floor(y/drawh)*we+Math.floor(x/draww)];
            var collIdx=Math.floor(y/drawh)*we+Math.floor(x/draww);
            //console.log('炮弹位置方向：',x,y,fwd);
            //console.log('映射到数组：',Math.floor(y/drawh)*we+Math.floor(x/draww));
            //console.log('地图元素：',gamingMap[Math.floor(y/drawh)*we+Math.floor(x/draww)]);

            switch(coll){
                case 0:
                    //检测通过,不处理
                    break;
                case 1:
                    //撞到墙壁
                    io.emit('hitwall',{fireIdx:i});
                    break;
                case 2:
                    //撞到box
                    io.emit('hitbox',{fireIdx:i,map:map});
                    break;
                default:break
            }

        }
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