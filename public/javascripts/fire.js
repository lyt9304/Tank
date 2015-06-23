/**
 * Created by lyt9304 on 15/6/7.
 */
var fireObj=function(){

    this.startx;
    this.starty;
    this.x;
    this.y;
    this.spd;
    this.fwd;//0:up,1:down,2:left,3:right

};


fireObj.prototype.init=function(_x,_y,_fwd){
    //设置初始位置
    this.startx=_x;
    this.starty=_y;

    //if(gamingMap[this._x*we+this._y]!=0){
        this.x=_x;
        this.y=_y;
    //};

    //设置speed和朝向
    this.spd=fireSpd;
    this.fwd=_fwd;
};

fireObj.prototype.draw=function(){
    switch(this.fwd){
        case 0: content.drawImage(AllPic,fireupStartx,fireupStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 1: content.drawImage(AllPic,firednStartx,firednStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 2: content.drawImage(AllPic,fireltStartx,fireltStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 3: content.drawImage(AllPic,firertStartx,firertStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        default: break;
    }
};

fireObj.prototype.check=function(gameMap){

};

fireObj.prototype.destroy=function(){

};