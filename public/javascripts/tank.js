/**
 * Created by lyt9304 on 15/6/7.
 */
var tankObj=function(){

    this.point;
    this.id;
    this.x;
    this.y;
    this.spd;
    this.fwd;//0:up,1:down,2:left,3:right
    this.live;
};

tankObj.prototype.init=function(_id,_x,_y,_fwd,_spd){
    this.id = _id;

    this.x=_x;
    this.y=_y;

    this.fwd=_fwd;
    this.spd=_spd;
    this.point=0;
    this.live=true;
};

tankObj.prototype.update=function(_id,_x,_y,_fwd,_spd){
    this.id = _id;
    this.x=_x;
    this.y=_y;
    this.fwd=_fwd;
    this.spd=_spd;
};

tankObj.prototype.draw=function(){
    switch(this.fwd){
        case 0: content.drawImage(AllPic,tankupStartx,tankupStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 1: content.drawImage(AllPic,tankdnStartx,tankdnStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 2: content.drawImage(AllPic,tankltStartx,tankltStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 3: content.drawImage(AllPic,tankrtStartx,tankrtStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        default: break;
    }
};