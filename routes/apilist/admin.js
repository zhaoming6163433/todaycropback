
var express = require('express');
var router = express.Router();

var User = require('../../models/User');
//统一返回格式
var responseData;

router.use(function(req,res,next){
    responseData = {
        code:0,
        message:'成功',
        result:[]
    }
    if(req.userInfo&&!req.userInfo.isAdmin){
        //如果当前用户是非管理员
        res.send('对不起，只有管理员才可以进入后台管理');
        return;
    }
    next();
});

/*
* 用户管理
* */
router.get('/user',function(req,res){
    /**
     * 从数据库中读取所有用户数据
     */
    User.find({},{'username':1,'password':1,'isAdmin':1,'_id':0}).then(function(users){
        res.header("Content-Type", "text/html");
        responseData.result = users;
        //let data = res.json(responseData);
        //res.send(data);
        res.render('admin/user_index',{
            users: responseData.result
        });
    });
})
module.exports = router;