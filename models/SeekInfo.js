/**
 * Created by zhaoming on 2017/9/26.
 */
/**
 * 创建表结构根据表结构创建模型 类型信息
 */
var mongoose = require('mongoose');
var seekinfoSchema = require('../schemas/seekinfo');

module.exports = mongoose.model('seekinfo',seekinfoSchema);