/**
 * Created by lyt9304 on 15/6/7.
 */
var tankObj=function(){

    this.id;
    this.x;
    this.y;
    this.spd;
    this.fwd;//0:up,1:down,2:left,3:right
    this.timer;

};

tankObj.prototype.init=function(_id){
    this.id = _id;

    //检查出生点是不是空的，不能在障碍物上
    do{
        this.x = Math.floor(Math.random()*(we-1)+1);//[1,we-1]
        this.y = Math.floor(Math.random()*(he-1)+1);
    }
    while(gamingMap[this.x*we+this.y]!=0);

    //变换到实际坐标位置
    this.x=this.x*draww;
    this.y=this.y*drawh;

    //设置speed和朝向
    this.spd=tankSpd;
    this.fwd=Math.floor(Math.random()*5+0);//[0,4]
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