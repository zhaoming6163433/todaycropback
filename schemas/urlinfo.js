/**
 * Created by zhaoming on 2017/9/25.
 */

var mongoose = require('mongoose');

//用户的表结构
module.exports = new mongoose.Schema({
    //地址
    url: String,
    //域名
    domain: String,
    //文字对象
    articleres: {
        title: String,
        content: String,
        html: String
    },
    //用户id
    userid: String,
    //文章可读性
    readability: Boolean,
    //logo图片
    logoimg: String
});
