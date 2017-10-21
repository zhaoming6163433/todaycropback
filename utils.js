var config = require('./config');
var path = require('path');
var Pageres = require('pageres');
var source = path.resolve(__dirname, './');

var utils = {
    //截取网站图片
    mypageres(url,callback){
        var pageres = new Pageres({delay: 2,timeout:30})
            .src(url, ['186x150'],{crop: true})//186x144
            .dest(source+'/public/cdn')
            .run()
            .then((res) => {
                console.log('图片抓取成功');
                callback(null,config.domain+'/public/cdn/'+res[0].filename);
            }).catch(function(error){
                // 处理getJSON和前一个回调函数运行时发生的错误
                callback(null,'');
            });
    },
    //是否登录校验
    checklogin(req,res){
        if(req.cookies.userInfo){
            return JSON.parse(req.cookies.userInfo);
        }else{
            res.responseData.code = 1000;
            res.responseData.message = '请先登录';
            res.json(res.responseData);
            return false;
        }
    },
    //截取url域名
    domainURI(str){
        var domain = str.match(/http[s]?:\/\/(.*?)([:\/]|$)/);
        return domain[1];
    },
    //处理自增长序列 根据用户id添加类别
    getNextSequenceValue(TypeCounters,userid,callback){
        TypeCounters.findOne({
            userid: userid
        }).then(function( Info ){
            if(!Info){
                var typecounters = new TypeCounters({
                    userid: userid,
                    sequence_value: 0
                });
                typecounters.save().then(function(newInfo){
                    callback(0);
                })
            }else{
                //序列表
                TypeCounters.findOneAndUpdate({userid:userid}, {$inc:{sequence_value:1}}, function(err,results){
                    if (err) return console.log(err);
                    callback(results.sequence_value+1);
                })
            }
        })
    }
}

module.exports = utils;