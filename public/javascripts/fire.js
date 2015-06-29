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

    this.live;
    this.picNo;
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

    this.live=true;
    this.picNo=0;
};

fireObj.prototype.draw=function(){
    content.drawImage(AllPic,firex,firey,cutw,cuth,this.x,this.y,draww,drawh);
    /*switch(this.fwd){
        case 0: content.drawImage(AllPic,fireupStartx,fireupStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 1: content.drawImage(AllPic,firednStartx,firednStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 2: content.drawImage(AllPic,fireltStartx,fireltStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        case 3: content.drawImage(AllPic,firertStartx,firertStarty,cutw,cuth,this.x,this.y,draww,drawh);break;
        default: break;
    }*/
};

fireObj.prototype.move=function(_fwd){
    switch(_fwd){
        case 0: this.y-=fireSpd;break;
        case 1: this.y+=fireSpd;break;
        case 2: this.x-=fireSpd;break;
        case 3: this.x+=fireSpd;break;
        default: break;
    }
    this.draw();
};

fireObj.prototype.check=function(x,y,fwd){
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

fireObj.prototype.checktank=function(x,y){
    for (var item in tankMap){
        //console.log(tankMap[item].id,tankMap[item].x,tankMap[item].y);
        if (tankMap[item].id==currentUser) {continue;}
        if ((x+drawh/2)>=tankMap[item].x && (x+drawh/2)<=(tankMap[item].x+drawh)&&
            (y+draww/2)>=tankMap[item].y && (y+draww/2)<=(tankMap[item].y+draww)
            ) {
            console.log(tankMap[item].id);
            return true;
        }
    }
    return false;
}

fireObj.prototype.destroy=function(x,y,fwd){
    if (this.picNo!=3)
    {
        this.picNo += 1;
        content.drawImage(AllPic,this.picNo*32,64,cutw,cuth,x,y,draww,drawh);
    }
    else
    {
        //改变地图元素
        //上 Math.floor(fireArr[i].y/drawh+0.5)*we+Math.floor(fireArr[i].x/draww+0.5)
        //下 Math.floor(fireArr[i].y/drawh+1.0)*we+Math.floor(fireArr[i].x/draww+0.5)
        //左 Math.floor(fireArr[i].y/drawh+0.5)*we+Math.floor(fireArr[i].x/draww+0.0)
        //右 Math.floor(fireArr[i].y/drawh+0.5)*we+Math.floor(fireArr[i].x/draww+1.0)
        picNo=0;
    }
};