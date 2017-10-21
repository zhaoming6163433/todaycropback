/**
 *应用程序启动（入口）文件
 */

//加载express模块
var express = require('express');
//加载模板处理模块
var swig = require('swig');
//加载数据库模块
var mongoose = require('mongoose');
//加载body-parse,用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载cookies模块
var cookie = require('cookie-parser');
//创建app应用
var app = express();

var User = require('./models/User');
var config = require('./config')

//设置跨域
app.all('/api/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.get('origin'));
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header("Access-Control-Allow-Credentials","true"); //带cookies

    next();
});
//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回__dirname+'/public'下的文件
app.use('/public',express.static(__dirname+'/public'));
//定义当前应用所使用都模板引擎
//第一个参数模板名称，第二个参数模板方法
app.engine('html',swig.renderFile);
//设置模板文件存放都目录，第一个参数必须是views,第二个参数是目录
app.set('views','./views');
//注册所使用都模板引擎，第一个参数必须是view engine,第二个参数和app.engine这个方法中定义的模板引擎的名称是一致的
app.set('view engine','html');
//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});
//格式化json
app.use(bodyParser.json());
//bodyparser设置 组件激活
app.use(bodyParser.urlencoded({extended:true}));

//设置cookie
app.use(cookie(''));
app.use(function(req,res,next){
	//解析登录用户的cookie信息
    req.cookieuserInfo = {};
	if(req.cookies.userInfo&&req.cookies.userInfo!='""'){
	    try{
            req.userInfo = JSON.parse(req.cookies.userInfo);
            //获取当前用户登录的类型 是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){
            next();
        }
    }else{
        next();
    }

});

//统一返回格式
app.use( function(req,res,next){
    res.responseData = {
        code:200,//200为成功 0为失败
        message:'',
        result:[]
    }
    next();
});
/**
 * 根据不同的功能划分模块
 */
app.use('/api',require('./routes/api'));
app.use('/',require('./routes/main'));


//监听http请求

mongoose.connect(config.dburl, { useMongoClient: true },function(err){
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        app.listen(8081);
    }
});
