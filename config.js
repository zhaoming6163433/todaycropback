/**
 * Created by zhaoming on 2017/9/19.
 */
/**
 * 配置编译环境和线上环境之间的切换
 *
 * domain: 域名地址
 *
 */
var domain = 'http://10.6.20.104:8081';

var dburl = 'mongodb://localhost:27018/blog';

module.exports = {
    domain,
    dburl
}
