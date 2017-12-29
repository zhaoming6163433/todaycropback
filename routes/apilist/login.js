
var express = require('express');
var extend = require('node.extend');
var router = express.Router();
var User = require('../../models/User');
var md5 = require('../../public/js/md5');


/**
 * 用户注册
 *  注册逻辑
 *
 *  1.用户不能为空
 *  2.密码不能为空
 *  3.两次输入密码必须一致
 *
 *  1.用户是否已经被注册
 *      数据库查询
 */
router.post('/user_register',function(req,res,next){

    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    //用户名不能为空
    if( username == '' || username == undefined ){
        res.responseData.code = 0;
        res.responseData.message = '用户名不能为空';
        res.json(res.responseData);
        return;
    }
    //密码不能为空
    if( password == '' || password == undefined ){
        res.responseData.code = 0;
        res.responseData.message = '密码不能为空';
        res.json(res.responseData);
        return;
    }
    //两次输入的密码必须一致
    if(password!=repassword){
        res.responseData.code = 0;
        res.responseData.message = '两次输入的密码不一致';
        res.json(res.responseData);
        return;
    }
    password = md5(password);
    repassword = md5(repassword);
    //用户名是否已经被注册了，如果数据库中存在注册数据，表示该用户已经注册
    User.findOne({
        username: username
    }).then(function( userInfo ){
        console.log(userInfo);
        if( userInfo ){
            res.responseData.code = 0;
            res.responseData.message = '用户名已经被注册了';
            res.json(res.responseData);
            return;
        }
        //保存用户注册的信息到数据库中 操作对象来操作数据库
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then(function(newUserInfo){
        console.log('newUserInfo的_id')
        console.log(newUserInfo);
        res.responseData.code = 200;
        res.responseData.message = '注册成功';
        //注册成功后把用户信息放到cookie中算登录
        res.cookie('userInfo',JSON.stringify({
            _id: newUserInfo._id,
            username: newUserInfo.username
        }));

        res.json(res.responseData);
        return;
    });

});
/*
 用户是否登录
 */
router.post('/user_islogin',function(req,res){

    if(req.cookies.userInfo){
        res.responseData.code = 200;
        res.responseData.message = '用户已登录';
        res.responseData.result = JSON.parse(req.cookies.userInfo);
        res.json(res.responseData);
        return;
    }else{
        res.responseData.code = 1000;
        res.responseData.message = '用户未登录';
        res.json(res.responseData);
        return;
    }
});
/*
 登录
 */
router.post('/user_login',function(req,res){
    var username = req.body.username;
    var password = md5(req.body.password);

    if( username == ''|| username == undefined || password == ''|| password == undefined){
        res.responseData.code = 0;
        res.responseData.message = '用户名或密码不能为空';
        res.json(res.responseData);
        return;
    }

    //查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo){
        if(!userInfo){
            res.responseData.code = 0;
            res.responseData.message = '用户名或密码错误';
            res.json(res.responseData);
            return;
        }
        //用户名和密码是正确的
        res.responseData.code = 200;
        res.responseData.message = '登录成功';
        res.responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };

        res.cookie('userInfo',JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));

        res.json(res.responseData);
        return;
    });
});

/*
 *  退出
 */
router.post('/user_logout',function(req,res){
    res.cookie('userInfo','');
    res.responseData.message = '退出成功';
    res.json(res.responseData);
});

module.exports = router;