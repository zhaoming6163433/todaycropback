/**
 * Created by zhaoming on 2017/9/26.
 */

var mongoose = require('mongoose');

//用户类别列表
module.exports = new mongoose.Schema({
    //用户id
    userid: { type:String },
    //类别名称
    seekname: { type:String },
    //类别 自增长
    type: { type:String },
    //排序
    sort: {type:String}
});