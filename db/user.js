var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Tank');


// Schema 结构
var mongooseSchema = new mongoose.Schema({
    uid : {type : String},
    pw : {type : String}
});

mongooseSchema.statics.findbyuser = function(uid, callback) {
    console.log("find:"+uid);
    return this.model('usertable').findOne({uid: uid}, callback);
};
var mongooseModel = mongoose.model('usertable', mongooseSchema);
module.exports=mongooseModel;