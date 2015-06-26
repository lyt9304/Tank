/**
 * Created by lyt9304 on 15/5/31.
 */
(function () {

    window.gameCommon = {

        //用户信息
        username:null,
        userid:null,

        //服务器信息
        gamerival:null,
        socket:null,

        logout:function(){
            //this.socket.disconnect();
            location.reload();
        },

        //第一个界面用户提交用户名
        usernameSubmit:function(){
            var username = $("#username").val();
            if(username != ""){
                $("#username").val("");
                $("#loginbox").hide();
                $("#playbox").show();
                this.init(username);
            }
            return false;
        },

        init:function(username){
            /*
             客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
             实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
             */
            this.userid = this.genUid();
            this.username = username;

            $("#showusername").html(this.username);

            //连接websocket后端服务器
            this.socket = io.connect('localhost:3000');

            //告诉服务器端有用户登录
            this.socket.emit('login', {userid:this.userid, username:this.username});
        }
    };
})();