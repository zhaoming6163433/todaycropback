/**
 * Created by zhaoming on 2017/9/18.
 */

var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
    res.header("Content-Type", "text/html");
    console.log(req.userInfo);
    //res.redirect('https://devo2o.zhiscity.com/o2omallwx/index.html');
    res.render('main/index',{
        userInfo:req.userInfo
    });
});

module.exports = router;