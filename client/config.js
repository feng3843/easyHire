/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://www.shouhutianshi.cn/weapp/api';
// var host = 'http://192.168.2.188/weapp/api';
var config = {

  // 下面的地址配合云端 Demo 工作
  server: {
    host,


  },
  app: {
    appid: `wx1836918ed875780c`,
    mch_id:`1509168601`,
    key: `shts2018shts2018shts2018shts2018` , //商户平台key 微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
    notify_url: "https://www.shouhutianshi.cn/weapp/notify/pay" //商户支付通知回调地址
    // appsecret: "220fb7d74018a2daed1660ae6ed0df98"
  
  }
};

module.exports = config;
