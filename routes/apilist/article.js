
var express = require('express');
var extend = require('node.extend');
var router = express.Router();
var read = require('node-readability');
var fs = require("fs");
var path = require('path');
var pathcdn = path.resolve(__dirname, '../../public/cdn/');
var async = require('async');
var WebSite = require('../../models/WebSite');//添加地址表
var UrlInfo = require('../../models/UrlInfo');//地址详情
var SeekInfo = require('../../models/SeekInfo');//类别表
var TypeCounters = require('../../models/TypeCounters');//类别序列表
var BlogArtAdd = require('../../models/BlogArtAdd');//添加博客内容
var utils = require('../../utils');

/**
 * 添加地址
 * params:{
 *  url:地址
 *  type:所属类别
 *  istoken:true 需要登录校验
 * }
 */
router.post('/add_website',function(req,res,next){

    var url = req.body.url;
    var type = req.body.type;
    var typeid = req.body.typeid;
    var ispublic = req.body.ispublic;
    var islogin = utils.checklogin(req,res);

    //正则校验地址
    var pattern = /(https|http):\/\/[\s\S]+/;
    if(!pattern.test(url)){
        res.responseData.code = 0;
        res.responseData.message = '该 URL 无效,无法保存。请使用以 http:// 或 https://开头的有效url';
        res.json(res.responseData);
        return;
    }
    //如果该用户登录了
    if(islogin){
        var userid = islogin._id;
        //该用户是否收藏过此地址
        WebSite.findOne({
            userid: userid,
            url: url
        }).then(function( Info ){
            if( Info ){
                res.responseData.code = 0;
                res.responseData.message = '该地址已经收藏过';
                res.json(res.responseData);
                return;
            }else{
                //保存用户注册的信息到数据库中 操作对象来操作数据库
                var website = new WebSite({
                    userid: userid,
                    url: url,
                    typeid: typeid,
                    quantity: 0,
                    setpublic: false,
                    systemtime:'',
                    domain: utils.domainURI(url),
                    type: type,
                    publictime: new Date().getTime(),
                    createTime: new Date().getTime()
                });
                return website.save();
            }
        }).then(function(newInfo){
            res.responseData.code = 200;
            res.responseData.message = '保存成功';
            res.json(res.responseData);
            return;
        }).catch(function(e){
            console.log(e)
        });

        //添加地址的同时再添加地址信息
        //该用户是否添加过地址信息
        UrlInfo.findOne({
            url: url,
            userid: userid
        }).then(function( Info ){
            if( !Info ) {
                //初始化对象
                var urlinfobj = {
                    articleres: {},
                    domain: utils.domainURI(url),
                    logoimg: '',
                    userid: userid,
                    readability: true,//文章可读性
                    url: url
                };
                //抓取图片
                var mypageres = function (callback) {
                    utils.mypageres(url, callback);
                }
                //获取文章标题、Logo、域名
                var getdomain = function (callback) {
                    read(url, function (err, article, meta) {
                        if (article) {
                            /*'content':article.content,
                             'title':article.title,
                             'html':article.html,
                             'document':article.document,
                             'meta':meta,
                             'err':err*/
                            var obj = {'content': article.content, 'title': article.title, 'html': article.html};
                            callback(null, obj);
                            article.close();
                        } else {
                            callback(null, {});
                        }
                    });
                }
                //多个函数并行执行,不会等待其他函数
                async.parallel([getdomain, mypageres], function (err, result) {
                    var articleres = result[0];
                    var logoimg = result[1];

                    if (err) {
                        console.log(err);
                    }

                    //计算权重值
                    if (JSON.stringify(articleres) == "{}" || articleres.content == false) {
                        urlinfobj.readability = false;
                    } else {
                        var scoree = articleres.content && articleres.content.split(',').length;
                        var scorec = articleres.content && articleres.content.split('，').length;
                        if ((scoree+scorec) < 10) {
                            urlinfobj.readability = false;
                        }
                    }

                    //保存用户注册的信息到数据库中 操作对象来操作数据库
                    if (articleres) {
                        extend(urlinfobj.articleres, articleres);
                    }
                    urlinfobj.logoimg = logoimg;
                    var urlinfo = new UrlInfo(urlinfobj);
                    urlinfo.save().then(function (newInfo) {
                        //成功后再次修改website表中的关联id
                        WebSite.update({userid:userid,url: newInfo.url}, {$set: {_urlinfo: newInfo._id}}).then(function (info) {

                        }).catch(function (err) {
                            console.log(err)
                        })
                    }).catch(function (err) {
                        console.log(err)
                    });
                });
            }
        });
    }
});
/**
 * 添加类别
 */
router.post('/add_seekname',function(req,res,next) {
    var seekname = req.body.seekname.trim();
    //登录校验
    var islogin = utils.checklogin(req, res);
    if(!islogin){ return; }

    //如果当前用户类别名称相同就提示不添加
    SeekInfo.findOne({
        userid: islogin._id,
        seekname: seekname
    }).then(function( Info ){
        if( Info ){
            res.responseData.code = 0;
            res.responseData.message = '该类别已添加';
            res.json(res.responseData);
            return false;
        }else{
            return true;
        }
    }).then(function(flag) {
        if(!flag){return}

        SeekInfo.count({ userid: islogin._id }).then(function( count ){

            return count;
        }).then(function(count){

            if(count>=20){
                res.responseData.code = 0;
                res.responseData.message = '最多可以添加20个类别';
                res.json(res.responseData);
                return;
            }

            //保存类别 type从1自增长
            utils.getNextSequenceValue(TypeCounters,islogin._id,function(type){
                var seekinfo = new SeekInfo({
                    userid: islogin._id,
                    seekname: seekname,
                    type:type,
                    sort:type
                });
                seekinfo.save().then(function(newInfo){
                    res.responseData.code = 200;
                    res.responseData.message = '保存成功';
                    res.json(res.responseData);
                    return;
                }).catch(function(error){
                    console.log(error)
                    res.responseData.code = 0;
                    res.responseData.message = '保存失败';
                    res.json(res.responseData);
                    return;
                });
            });
        })

    });

});

/**
 *  删除指定类别
 *  params:{
 *      _id:类别id
 *  }
 */
router.post('/del_seek',function(req,res,next) {
    //登录校验
    var islogin = utils.checklogin(req, res);
    if(!islogin){ return; }

    SeekInfo.remove({_id:req.body._id},function(err,result){
        if(err){
            res.responseData.code = 0;
            res.responseData.message = '删除失败';
        }else{
            res.responseData.code = 200;
            res.responseData.message = '删除成功';
        }
        res.json(res.responseData);
    });

});


/**
 * 获取当前用户的类别
 */
router.post('/get_seek',function(req,res,next) {
    //登录校验
    var islogin = utils.checklogin(req, res);
    if(!islogin){ return; }

    //如果当前用户类别名称相同就提示不添加
    SeekInfo.find({
        userid: islogin._id
    },{'_id':1,'sort':1, 'type':1,'seekname':1}).sort({sort: 1}).then(function( Info ){
        res.responseData.code = 200;
        res.responseData.message = '获取成功';
        res.responseData.result = Info;
        res.json(res.responseData);
    }).catch(function(err){
        console.log(err.message);
        res.responseData.code = 0;
        res.responseData.message = err.message;
        res.json(res.responseData);
    })

});

/**
 * 修改类别顺序
 */
router.post('/update_seeksort',function(req,res,next) {
    //登录校验
    var islogin = utils.checklogin(req, res);
    if(!islogin){ return; }

    var _arry = req.body.updatearry;
    var uparry = [];

    //由于闭包内部函数找不到变量去父节点寻找，此时for已执行完毕返回的永远都是最后一个变量
    //通过外层套用自执行函数传参数方式解决此问题
    for(var i=0;i<_arry.length;i++){
        var _id = _arry[i]._id;
        uparry[i] = (function (i,_id) {
            return function(callback) {
                SeekInfo.update({_id: _id}, {$set: {sort: i}}).then(function (info) {
                    callback(null, info);
                }).catch(function (err) {
                    callback(null, err);
                })
            }
        })(i,_id);
    }

    if(!uparry){
        res.responseData.code = 0;
        res.responseData.message = '失败';
        res.json(res.responseData);
    }

    async.parallel(uparry, function (err, result) {
        if(err){
            res.responseData.code = 0;
            res.responseData.message = '失败';
            res.json(res.responseData);
        }else{
            res.responseData.code = 200;
            res.responseData.message = '成功';
            res.json(res.responseData);
        }
    });


});

/**
 * 通过文章id获取文章信息，不再读取了 给nuxt提供的接口目前都不用登录，不同源所以不能获取cookie
 */
router.get('/getArticle',function(req,res,next){
    var id= req.query.id;

    UrlInfo.findOne({
        _id: id
    }).then(function( Info ){
        res.responseData.code = 200;
        res.responseData.message = '成功';
        res.responseData.result = Info;
        res.json(res.responseData);

    }).catch(function(err){
        console.log(err.message);
        res.responseData.code = 0;
        res.responseData.message = err.message;
        res.json(res.responseData);
    })
});

/**
 *  连表查询用户url对应的详情
 */
router.post('/getWebUrlInfo',function(req,res,next){
    var islogin = utils.checklogin(req, res);
    if(!islogin){ return; }
    var userid = req.body.id;
    var type = req.body.type;
    var typeid = req.body.typeid;
    var pageNum = req.body.pageNum;
    var pageSize = parseInt(req.body.pageSize);
    var page = (parseInt(pageNum)-1)*pageSize;
    var params = {userid:userid};

    typeid ? params = {userid:userid, typeid:typeid}:'';

    WebSite.count(params).then(function( totoalnum ){
        WebSite.find(params).populate('_urlinfo',{ __v:0}).limit(pageSize)
            .skip(page).sort({createTime: -1}).exec(function(err, list) {
            if(err){
                console.log(err);
                res.responseData.code = 0;
                res.responseData.message = '失败';
            }else{
                //计算共几页
                res.responseData.totalpage = Math.ceil(totoalnum/pageSize);
                res.responseData.code = 200;
                res.responseData.message = '成功';
                res.responseData.result = list;
            }
            res.json(res.responseData);
        });
    }).catch(function(err){
        res.responseData.code = 0;
        res.responseData.message = '失败';
    })

});

/**
 * 首页公共文章接口
 */
router.get('/public_article',function(req,res,next){

    var pageNum = req.query.pageNum;
    var pageSize = parseInt(req.query.pageSize);
    var page = (parseInt(pageNum)-1)*pageSize;

    WebSite.count({setpublic:true}).then(function( totoalnum ){
        WebSite.find({setpublic:true}).populate('_urlinfo',{ __v:0 }).limit(pageSize)
            .skip(page).sort({quantity: -1}).exec(function(err, list) {
            if(err){
                console.log(err);
                res.responseData.code = 0;
                res.responseData.message = '失败';
            }else{
                //传递系统时间
                list.forEach(function(item){
                    item.systemtime = new Date().getTime();
                });
                //计算共几页
                res.responseData.totalpage = Math.ceil(totoalnum/pageSize);
                res.responseData.code = 200;
                res.responseData.message = '成功';
                res.responseData.result = list;
            }
            res.json(res.responseData);
        });
    }).catch(function(err){
        res.responseData.code = 0;
        res.responseData.message = '失败';
    })
});

/**
 * 删除当前用户文章
 */
router.post('/delWebUrlInfo',function(req,res,next){
    var islogin = utils.checklogin(req, res);
    if(!islogin){ return; }

    var del  = {userid:islogin._id, url:req.body.url};
    var WebSitedel = function (callback) {
        WebSite.remove(del,function(err,result){
            if(err){
                callback(null, {});
            }else{
                callback(null, result);
            }
        });
    }
    var UrlInfodel = function (callback) {
        UrlInfo.remove(del,function(err,result){
            if(err){
                callback(null, {});
            }else{
                callback(null, result);
            }
        });
    }

    async.parallel([WebSitedel, UrlInfodel], function (err, result) {
        if (err) {
            console.log(err);
            res.responseData.code = 0;
            res.responseData.message = '删除失败';
        }else{
            var res0 = result[0];
            var res1 = result[1];
            if(res0.result.ok==1 && res1.result.ok==1){
                res.responseData.code = 200;
                res.responseData.message = '删除成功';
                //删除对应图片
                if(req.body.logoimg){
                    try{
                        var filepath = pathcdn+'/'+req.body.logoimg.substr(req.body.logoimg.indexOf('cdn/')+4);
                        fs.unlinkSync(filepath)
                    }catch (e){}
                }
            }else{
                res.responseData.code = 0;
                res.responseData.message = '删除失败';
            }
        }
        res.json(res.responseData);
    });
});

/**
 * 设置地址公开或私有
 */

router.post('/set_addr_pub',function(req,res,next){
    var islogin = utils.checklogin(req, res);
    if(!islogin){ return; }

    var _id = req.body._id;
    var userid = islogin._id;
    var setpublic = req.body.setpublic;
    var publictime = new Date().getTime();

    WebSite.update({userid:userid, _id: _id}, {$set: {setpublic: setpublic, publictime:publictime}}).then(function (info) {
        res.responseData.code = 200;
        res.responseData.message = '成功';
        res.json(res.responseData);
    }).catch(function (err) {
        res.responseData.code = 0;
        res.responseData.message = '失败';
        res.json(res.responseData);
    })
});

/**
 * 修改阅读量
 */

router.post('/up_quantity',function(req,res){


    var _id = req.body._id;
    WebSite.findOneAndUpdate({_id:_id}, {$inc:{quantity:1}}, function(err,results){
        if (err) {
            res.responseData.code = 0;
            res.responseData.message = '失败';
        }else{
            res.responseData.code = 200;
            res.responseData.message = '成功';
        }
        res.json(res.responseData);
    })
});

/**
 * 修改文章到指定分类
 */

router.post('/up_url_seek',function(req,res){

    var islogin = utils.checklogin(req, res);
    if(!islogin){ return; }

    var _id = req.body._id;
    var userid = islogin._id;
    var typeid = req.body.typeid;
    var type = req.body.type;

    WebSite.update({userid:userid, _id: _id}, {$set: {typeid: typeid, type:type}}).then(function (info) {
        res.responseData.code = 200;
        res.responseData.message = '成功';
        res.json(res.responseData);
    }).catch(function (err) {
        res.responseData.code = 0;
        res.responseData.message = '失败';
        res.json(res.responseData);
    })
});
/**
 *  博客创建文章
 *  params:{
 *      _id:类别id
 *  }
 */
router.post('/add_blog_art',function(req,res,next) {

    var userid = req.body._id;
    var title = req.body.title;
    var content = req.body.content;

    var blogart = new BlogArtAdd({
        userid: userid,
        title: title,
        date:new Date().getTime(),
        content:content
    });
    blogart.save().then(function(){
        res.responseData.code = 200;
        res.responseData.message = '保存成功';
        res.json(res.responseData);
        return;
    }).catch(function(error){
        console.log(error)
        res.responseData.code = 0;
        res.responseData.message = '保存失败';
        res.json(res.responseData);
        return;
    });

});

/**查找文章*/
router.post('/getartlist',function(req,res,next){
    var userid = req.body._id;

    BlogArtAdd.find({
        userid: userid
    }).then(function( Info ){
        res.responseData.code = 200;
        res.responseData.message = '成功';
        res.responseData.result = Info;
        res.json(res.responseData);

    }).catch(function(err){
        console.log(err.message);
        res.responseData.code = 0;
        res.responseData.message = err.message;
        res.json(res.responseData);
    })
});

/**
 * 查找详情
 */
router.post('/getartdetail',function(req,res,next) {

    var id = req.body.id;
    BlogArtAdd.findOne({
        _id: id
    }).then(function (Info) {
        res.responseData.code = 200;
        res.responseData.message = '成功';
        res.responseData.result = Info;
        res.json(res.responseData);
    }).catch(function(err){
        console.log(err.message);
        res.responseData.code = 0;
        res.responseData.message = err.message;
        res.json(res.responseData);
    })

});
module.exports = router;