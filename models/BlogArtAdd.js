/**
 * Created by zhaoming on 2017/12/30
 */

var mongoose = require('mongoose');
var blogartaddSchema = require('../schemas/blogartadd');

module.exports = mongoose.model('BlogArtAdd',blogartaddSchema);