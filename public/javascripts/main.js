/**
 * Created by lyt9304 on 15/6/6.
 */

/************全局需要的参数**************/
var canvas;//canvas对象
var content;//canvas画布内容

var w,h;//canvas的宽度和长度
var we=10;//canvas可以容下的宽度的数量和长度的数量
var he=10;

var AllPic = new Image();
AllPic.src="/images/tanks_sheet.png";

var cutw=32;//切图时的宽和高
var cuth=32;

var draww=32;//画到canvas上的宽和高
var drawh=32;

var tankSpd=5;
var fireSpd=1.5;

var gamingMap=[];//当前正在玩的游戏地图

var tankupStartx=32;//坦克切图的左上角位置
var tankupStarty=0;

var tankltStartx=64;
var tankltStarty=0;

var tankrtStartx=96;
var tankrtStarty=0;

var tankdnStartx=128;
var tankdnStarty=0;

var fireupStartx=128;//炮弹切图的左上角位置
var fireupStarty=64;

var firednStartx=224;
var firednStarty=32;

var fireltStartx=192;
var fireltStarty=32;

var firertStartx=160;
var firertStarty=32;

var wallStartx=224;//墙切图的左上角位置
var wallStarty=96;

var boxStartx=0;//box切图的左上角位置
var boxStarty=96;

var tolerance=3;//偏差2px,不然碰撞检测有些太狭窄过不去

//map中0：啥都没，1：wall，2：box
//TODO:扩展为Map，可以有很多种地图
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

gamingMap=[
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
];
/************全局需要的参数**************/

var tankEnt = new tankObj();
tankEnt.init();

var fireArr=[];

function initGame(){
    canvas=document.getElementById("gameCanvas");
    content=canvas.getContext("2d");

    w=canvas.width;
    h=canvas.height;

    updateGameView();
}

function drawBackground(){
    content.fillStyle="black";
    content.fillRect(0,0,w,h);
}

function drawWall(cx,cy){
    content.drawImage(AllPic,wallStartx,wallStarty,cutw,cuth,cx,cy,draww,drawh);
}

function drawBox(cx,cy){
    content.drawImage(AllPic,boxStartx,boxStarty,cutw,cuth,cx,cy,draww,drawh);
}

function drawMap(gameMap){
    drawBackground();
    for(var i=0;i<we;i++){
        for(var j=0;j<he;j++){
            var mapItem=gameMap[i*we+j];
            switch(mapItem){
                case 0:break;
                case 1:drawWall(i*draww,j*drawh);break;
                case 2:drawBox(i*draww,j*drawh);break;
                default:break;
            }
        }
    }
}

//需要键盘触发的
function updateGameView(){
    //Step1:Background;

    //Step2:UpdatedGamingMap;
    drawMap(gamingMap);

    //Step3:UpdatedTankObjs;(fwd,move);
    tankEnt.draw();

    //Step4:Fire;
    for(var i=0;i<fireArr.length;i++){
        if(checkFire(fireArr[i].x,fireArr[i]))
            fireArr[i].draw();
    }

    //Step5:OtherEvent:destroy;
}

//时间触发的，用于绘制子弹
function timelyUpdateGameView(){
    for(var i=0;i<fireArr.length;i++){
        if(checkFire(fireArr[i].x,fireArr[i]))
        fireArr[i].draw();
    }
}

//监听键盘事件
//37:left 38:up 39:right 40:down space:32
var keyPressList=[];
document.onkeydown=function(e){
    e = event || window.event || arguments.callee.caller.arguments[0];
    console.log("key:"+ e.keyCode);
    switch (e.keyCode){
        case 37://left
            if(checkField(tankEnt.x-tankEnt.spd+tolerance,tankEnt.y+tolerance)){
                tankEnt.fwd=2;
                tankEnt.x-=tankEnt.spd;
                updateGameView();
            }
            break;
        case 38://up
            if(checkField(tankEnt.x+tolerance,tankEnt.y-tankEnt.spd+tolerance)){
                tankEnt.fwd=0;
                tankEnt.y-=tankEnt.spd;
                updateGameView();
            }
            break;
        case 39://right
            if(checkField(tankEnt.x+tankEnt.spd+draww-tolerance,tankEnt.y+tolerance)){
                tankEnt.fwd=3;
                tankEnt.x+=tankEnt.spd;
                updateGameView();
            }
            break;
        case 40://down
            if(checkField(tankEnt.x+tolerance,tankEnt.y+tankEnt.spd+drawh-tolerance)){
                tankEnt.fwd=1;
                tankEnt.y+=tankEnt.spd;
                updateGameView();
            }
            break;
        case 32://space fire
            //生成一个炮弹，放到维护的数组
            var fireEnt = new fireObj();
            //根据坦克方向生成对应方向的炮弹
            switch (tankEnt.fwd){
                case 0://up
                    fireEnt.init(tankEnt.x+draww/2,tankEnt.y,0);
                    break;
                case 1://down
                    fireEnt.init(tankEnt.x+draww/2,tankEnt.y+drawh,1);
                    break;
                case 2://left
                    fireEnt.init(tankEnt.x,tankEnt.y+draww/2,0);
                    break;
                case 3://right
                    fireEnt.init(tankEnt.x+draww,tankEnt.y+draww/2,0);
                    break;
                default:break;
            }
            fireArr.push(fireEnt);
            updateGameView();
            break;
        default:
            break;
    }
};

//碰撞检测
function checkField(x,y){
    console.log(gamingMap[Math.floor(x/draww)*we+Math.floor(y/drawh)]);
    if(gamingMap[Math.floor(x/draww)*we+Math.floor(y/drawh)] == 0){
        return true;
    }
    else{
        return false;
    }
}

function checkFire(x,y,fwd){
    return true;
}


