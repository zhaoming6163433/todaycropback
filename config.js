/**
 * Created by zhaoming on 2017/9/19.
 */
/**
 * 配置编译环境和线上环境之间的切换
 *
 * domain: 域名地址
 *
 */
var domain = 'http://47.52.227.158';//'http://10.6.20.104:8081'

var dburl = 'mongodb://zhaoming:zhaoming@172.31.196.178/databaseFoo';//'mongodb://localhost:27018/blog';

module.exports = {
    domain,
    dburl
}
