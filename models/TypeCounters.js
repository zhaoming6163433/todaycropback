/**
 * Created by zhaoming on 2017/9/26.
 */

var mongoose = require('mongoose');
var typecountersSchema = require('../schemas/typecounters');

module.exports = mongoose.model('TypeCounters',typecountersSchema);