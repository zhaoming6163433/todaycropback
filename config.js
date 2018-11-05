/**
 * Created by zhaoming on 2017/9/19.
 */
/**
 * 配置编译环境和线上环境之间的切换
 *
 * domain: 域名地址
 *
 */
var domain = 'http://www.todaypocket.cn';//'http://10.6.20.104:8081' http://47.244.113.141

var dburl = 'mongodb://47.244.113.141:27017/databaseFoo';//'mongodb://localhost:27018/blog'; mongodb://@127.0.0.1/databaseFoo

module.exports = {
    domain,
    dburl
}
