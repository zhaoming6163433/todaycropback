/**
 * Created by zhaoming on 2017/9/25.
 */
/**
 * 应用中操作模型来对数据进行增删改查，模型基于结构来处理
 * 创建表结构根据表结构创建模型
 */
var mongoose = require('mongoose');
var urlinfoSchema = require('../schemas/urlinfo');

module.exports = mongoose.model('UrlInfo',urlinfoSchema);