/**
 * Created by zhaoming on 2017/12/30.
 */

var mongoose = require('mongoose');

//添加博客
module.exports = new mongoose.Schema({
    //用户id
    userid: { type:String },
    //标题
    title: { type:String },
    //日期
    date: { type:String },
    //内容
    content: {type:String}
});