/**
 * Created by lyt9304 on 15/6/6.
 */

/************全局需要的参数**************/
var canvas;//canvas对象
var content;//canvas画布内容

var currentUser="";
var currentTank;

var gameStartFlag=false;

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
var fireSpd=5;

var gamingMap=[];//当前正在玩的游戏地图

var tankupStartx=32;//坦克切图的左上角位置
var tankupStarty=0;

var tankltStartx=64;
var tankltStarty=0;

var tankrtStartx=96;
var tankrtStarty=0;

var tankdnStartx=128;
var tankdnStarty=0;

var firex=160; //小炮弹
var firey=64;

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

var gamingMap=[];
var gamingTank={};
var gaminFire={};
/************全局需要的参数**************/

//var tankEnt = new tankObj();
//tankEnt.init();

var fireArr=[];
var tankMap={};

function deepCopy(source) {
    var result={};
    for (var key in source) {
        result[key] = typeof source[key]==='object'? deepCoyp(source[key]): source[key];
    }
    return result;
}

function initGame(){
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
    for(var i=0;i<he;i++){
        for(var j=0;j<we;j++){
            var mapItem=gameMap[i*we+j];
            switch(mapItem){
                case 0:break;
                case 1:drawWall(j*draww,i*drawh);break;
                case 2:drawBox(j*draww,i*drawh);break;
                case 3:break;
                default:break;
            }
        }
    }
}

//需要键盘触发的
function updateGameView(){
    //Step1:Background;
    drawBackground();

    //Step2:UpdatedGamingMap;
    drawMap(gamingMap);

    //Step3:UpdatedTankObjs;(fwd,move);
    for(var item in tankMap){
        //console.log(item);
        tankMap[item].draw();
    }

    //console.log("after draw");

    //Step4:Fire;
    for(var i=0;i<fireArr.length;i++){
        if(fireArr[i].check(fireArr[i].x,fireArr[i].y,fireArr[i].fwd)==1)
        {
            fireArr.shift();
        }
        else if(fireArr[i].check(fireArr[i].x,fireArr[i].y,fireArr[i].fwd)==0)
        {
            fireArr[i].move(fireArr[i].fwd);
        }
        else if(fireArr[i].check(fireArr[i].x,fireArr[i].y,fireArr[i].fwd)==2)
        {
            fireArr[i].destroy(fireArr[i].x,fireArr[i].y);
            fireArr.shift();
        }
    }

    //Step5:OtherEvent:destroy;
}

//时间触发的，用于绘制子弹
/*function timelyUpdateGameView(){
    drawMap(gamingMap);
    tankEnt.draw();
    var collusion=fireArr[i].check(fireArr[i].x,fireArr[i].y,fireArr[i].fwd);
    for(var i=0;i<fireArr.length;i++){
        if(collusion==0)
           fireArr[i].move(fireArr[i].fwd);
    }
}*/


setInterval(updateGameView,100);

//碰撞检测
function checkField(x,y){
    console.log(gamingMap[Math.floor(y/drawh)*we+Math.floor(x/draww)]);
    if(gamingMap[Math.floor(y/drawh)*we+Math.floor(x/draww)] == 0){
        return true;
    }
    else{
        return false;
    }
}