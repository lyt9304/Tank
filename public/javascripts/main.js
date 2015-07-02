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
var we=20;//canvas可以容下的宽度的数量和长度的数量
var he=15;

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
//var gaminFire={};
/************全局需要的参数**************/

var fireArr=[];
var tankMap={};
var fireMap={};


setInterval(window.gameCommon.updateGameView,100);


