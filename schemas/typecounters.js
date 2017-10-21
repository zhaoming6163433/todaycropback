/**
 * Created by zhaoming on 2017/9/26.
 */
var mongoose = require('mongoose');

//type自增长表
module.exports = new mongoose.Schema({
    userid: String,
    sequence_value: Number
});