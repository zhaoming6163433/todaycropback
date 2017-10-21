//加载express模块
var express = require('express');
var router = express.Router();

//登录相关接口
router.use('/login',require('./apilist/login'));
//文章地址收藏相关接口
router.use('/article',require('./apilist/article'));
//后台管理系统相关接口
router.use('/admin',require('./apilist/admin'));

module.exports = router;