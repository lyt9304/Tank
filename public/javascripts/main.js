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

var tankSpd=1.5;
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

var wallStartx=224;//墙切图的左上角位置
var wallStarty=96;

var boxStartx=0;//box切图的左上角位置
var boxStarty=96;

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

function updateGameView(){
    //Step1:Background;

    //Step2:UpdatedGamingMap;
    drawMap(gamingMap);
    //Step3:UpdatedTankObjs;(fwd,move);
    tankEnt.draw();
    //Step4:Fire;
    //Step5:OtherEvent:destroy;
}

//监听键盘事件
//37:left 38:up 39:right 40:down space:32
var keyPressList=[];
document.onkeydown=function(e){
    e = event || window.event || arguments.callee.caller.arguments[0];
    switch (e.keyCode){
        case 37://left
            if(checkField(tankEnt.x-tankEnt.spd,tankEnt.y)){
                tankEnt.fwd=2;
                tankEnt.x-=tankEnt.spd;
                updateGameView();
            }
            break;
        case 38://up
            if(checkField(tankEnt.x,tankEnt.y-tankEnt.spd)){
                tankEnt.fwd=0;
                tankEnt.y-=tankEnt.spd;
                updateGameView();
            }
            break;
        case 39://right
            if(checkField(tankEnt.x+tankEnt.spd,tankEnt.y)){
                tankEnt.fwd=3;
                tankEnt.x+=tankEnt.spd;
                updateGameView();
            }
            break;
        case 40://down
            if(checkField(tankEnt.x,tankEnt.y+tankEnt.spd)){
                tankEnt.fwd=1;
                tankEnt.y+=tankEnt.spd;
                updateGameView();
            }
            break;
        case 32://space fire
            //TODO:fire
            break;
        default:
            break;
    }
};

//document.onkeyup=function(e){
//    e = event || window.event || arguments.callee.caller.arguments[0];
//};

function checkField(x,y){
    return true;
}

function checkFire(x,y){
    return true;
}


