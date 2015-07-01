/**
 * Created by lyt9304 on 15/7/1.
 */
var mongoose = require('mongoose');
//mongoose.connect('mongodb://127.0.0.1:27017/Tank');

// Schema 结构
var mongooseSchema = new mongoose.Schema({
    index : {type : Number},
    record: {type : Mixed}
});

mongooseSchema.statics.findbyindex = function(index, callback) {
    console.log("findsort");
    return this.model('sorttable').findOne({index: 1}, callback);
};

var mongooseModel = mongoose.model('sorttable', mongooseSchema);
module.exports=mongooseModel;