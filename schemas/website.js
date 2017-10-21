/**
 * Created by zhaoming on 2017/9/25.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户新增地址的表结构
module.exports = new Schema({
    //用户id
    userid: String,
    //地址
    url: String,
    //所属分类
    type: String,
    //所属类别id
    typeid: String,
    //添加时间戳
    createTime: Number,
    //是否设置公开
    setpublic: Boolean,
    //公开时间或私有设置时间
    publictime: Number,
    //域名
    domain: String,
    //阅读量
    quantity: Number,
    //系统时间不存数据库
    systemtime: Number,
    _urlinfo: {
        type: Schema.Types.ObjectId,
        ref: 'UrlInfo'
    }
});