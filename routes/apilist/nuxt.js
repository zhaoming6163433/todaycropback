
var express = require('express');
var router = express.Router();
var utils = require('../../utils');

/**
 * 获取用户ip
 */
router.get('/userip',function(req,res){

    var userip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    userip = userip.substr(userip.lastIndexOf(":")+1);
    res.responseData.code = 0;
    res.responseData.message = '获取成功';
    res.responseData.result = {userip:userip};
    res.json(res.responseData);

    return;
})
module.exports = router;