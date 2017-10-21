/**
 * Created by zhaoming on 2017/9/25.
 */
/**
 * 创建表结构根据表结构创建模型 地址信息表
 */
var mongoose = require('mongoose');
var websiteSchema = require('../schemas/website');

module.exports = mongoose.model('WebSite',websiteSchema);