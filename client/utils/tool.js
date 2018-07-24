let url = "https://api.mch.weixin.qq.com/pay/unifiedorder"
let config = require("../config.js")
let MD5 = require('./MD5.js')
let key = config.app.key
let app = getApp()

module.exports = {
  //随机订单号
  getOut_trade_no: function() {
    let date = new Date()
    let fullY = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let timesnap = date.getTime()
    let random = Math.floor(Math.random() * 999 + 1)
    return "" + fullY + month + day + random + timesnap
  },

 
  //本地ip
  spbill_create_ip: function() {
    return "127.0.0.1"
  },

  //随机字串
  nonce_str: function() {
    return "abcde6fghij2klmn4opqrs2t4uvwxyz0123456789".substr(Math.floor(Math.random() * 6 + 1), Math.floor(Math.random() * 29 + 1))
  },

  // 时间戳产生函数  
  createTimeStamp: function() {
    return parseInt(new Date().getTime() / 1000) + ''
  },

  //字典排序
  raw: function(args) {
    var keys = Object.keys(args)
    keys = keys.sort()
    var newArgs = {}
    keys.forEach(function(key) {
      if (args[key] !== "") {
        newArgs[key] = args[key]
      }
    })
    var string = ''
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k]
    }
    string = string.substr(1)
    return string
  },


  // 统一下单接口加密获取sign
  paysignjsapi: function(dict) {
    var string = this.raw(dict)
    string = string + '&key=' + key
    console.log(string)
    var sign = MD5.hex_md5(string)
    return sign.toUpperCase()
  },

  // testSign() {
  //   let dict = {
  //     appid: 'wx1836918ed875780c',
  //     bank_type: 'CFT',
  //     cash_fee: '1',
  //     fee_type: "CNY",
  //     is_subscribe: 'N',
  //     mch_id: '1509168601',
  //     nonce_str: 'fghij2klmn4',
  //     openid: 'oKh294lUGmQa1257xvQsNt2jrCGQ',
  //     out_trade_no: '2018718-736-1531895988572',
  //     result_code: 'SUCCESS',
  //     return_code: 'SUCCESS',
  //     time_end: '20180718143955',
  //     total_fee: 1,
  //     trade_type: 'JSAPI',
  //     transaction_id: "4200000132201807182689282555"
  //   }
  //   console.log(dict)
  //   console.log("sign" + this.paysignjsapi(dict))
  // },



// 获取预订单号
  getPrepay_idFromSever: function(total_fee, detail) {
    return new Promise((resolve, reject) => {
      let that = this
      let openId = wx.getStorageSync("openId")
      let nonce_str = this.nonce_str()
      let out_trade_no = this.getOut_trade_no()
      let spbill_create_ip = this.spbill_create_ip()
      let dict = {
        appid: config.app.appid,
        mch_id: config.app.mch_id,
        detail: detail,
        nonce_str: nonce_str,
        openid: openId,
        total_fee: total_fee,
        body: "一键职场 - 金豆充值",
        out_trade_no: out_trade_no,
        spbill_create_ip: spbill_create_ip,
        notify_url: config.app.notify_url,
        trade_type: "JSAPI"
      }
      let sign = this.paysignjsapi(dict)
      console.log(sign)
      console.log(dict)
      if (openId) {
        wx.request({
          url: `${config.server.host}/getPrepay_id`,
          method: "POST",
          data: {
            appid: config.app.appid,
            detail: detail,
            mch_id: config.app.mch_id,
            nonce_str: nonce_str,
            openid: openId,
            total_fee: total_fee,
            body: "一键职场 - 金豆充值",
            out_trade_no: out_trade_no,
            spbill_create_ip: spbill_create_ip,
            notify_url: config.app.notify_url,
            trade_type: "JSAPI",
            sign: sign
          },
          success: function(res) {
            console.log(res)
            if (res.data.code == 0) {
              let prepay_id = res.data.result.prepay_id
              console.log("prepay_id" + prepay_id)
              resolve(prepay_id)
            } else {
              wx.showToast({
                title: '订单获取失败',
                mask: true,
                icon: "none"
              })
              let e = new Error("订单获取失败")
              reject(e)
            }
          },
          fail: function(e) {
            console.log(e)
            reject(e)
          }
        })
      } else {
        wx.navigateTo({
          url: '/pages/login/login?name=登录过期',
        })
        wx.showToast({
          title: '登录过期，重新登录',
          icon: "none"
        })
        let e = new Error("登录过期，重新登录")
        reject(e)
      }
    })

  },


  //下单
  order: function(total_fee, detail) {
    let that = this
    let fee = parseInt(total_fee)
    if (fee < 1 || isNaN(fee)) {
      console.log(fee)
      wx.showToast({
        title: '商品信息错误，稍后再试',
        icon: "none"
      })
      return
    }

    this.getPrepay_idFromSever(fee, detail).then((prepay_id) => {
      console.log("支付参数")
      let timeStamp = that.createTimeStamp()
      let nonceStr = that.nonce_str()

      //支付参数
      let dict = {
        appId: config.app.appid,
        timeStamp: timeStamp,
        nonceStr: nonceStr,
        package: `prepay_id=${prepay_id}`,
        signType: 'MD5',
      }
      //本地签名
      let sign = that.paysignjsapi(dict)

      console.log(sign)
      //发起支付
      wx.requestPayment({
        timeStamp: timeStamp,
        nonceStr: nonceStr,
        package: `prepay_id=${prepay_id}`,
        signType: 'MD5',
        paySign: sign,
        //支付成功
        success: function(res) {
          console.log(res)
          if (res.errMsg == "requestPayment:ok"){
            app.gData.needPullDownRefresh = true
            wx.showToast({
              title: '支付成功',
              mask: true,
              duration: 1500
            })
            setTimeout(() => { wx.navigateBack({})},1500)
          }
          
        },
        //支付失败
        fail: function(e) {
          console.log(e)
          wx.showToast({
            title: '支付失败',
            icon: "none"
          })
        }
      })

    }).catch((e) => {
      console.log(e)
    })

  }

}


// getPrepay_id: function(total_fee,detail) {
  //   let that = this

  //   return new Promise((reslove, reject) => {
  //     let openId = wx.getStorageSync("openId")
  //     let dict = {
  //       appid: config.app.appid,
  //       mch_id: config.app.mch_id,
  //       nonce_str: this.nonce_str(),
  //       openid: openId,
  //       total_fee:total_fee,
  //       body: "一键职场 - 金豆充值",
  //       out_trade_no: this.getOut_trade_no(),
  //       spbill_create_ip: this.spbill_create_ip(),
  //       notify_url: "http://www.shouhutianshi.cn",
  //       trade_type: "JSAPI"
  //     }
  //     if (typeof (detail)=="String"){
  //       dict['detail'] = detail
  //     }

  //     console.log(dict)

  //     let sign = this.paysignjsapi(dict)
  //     console.log(sign)

  //     let formData = "<xml>"
  //     formData += "<appid>" + dict.appid + "</appid>" //appid  
  //     if (typeof (detail) == "String") {
  //       formData += "<detail>" + dict.detail + "</detail>"
  //     }
  //     formData += "<body>" + dict.body + "</body>"
  //     formData += "<mch_id>" + dict.mch_id + "</mch_id>" //商户号  
  //     formData += "<nonce_str>" + dict.nonce_str + "</nonce_str>" //随机字符串，不长于32位。  
  //     formData += "<notify_url>" + dict.notify_url + "</notify_url>"
  //     formData += "<openid>" + openId + "</openid>"
  //     formData += "<out_trade_no>" + dict.out_trade_no + "</out_trade_no>"
  //     formData += "<spbill_create_ip>" + dict.spbill_create_ip + "</spbill_create_ip>"
  //     formData += "<total_fee>" + dict.total_fee + "</total_fee>"
  //     formData += "<trade_type>" + dict.trade_type + "</trade_type>"
  //     formData += "<sign>" + sign + "</sign>"
  //     formData += "</xml>"


  //     console.log(formData)
  //     wx.request({
  //       url: url,
  //       method: "POST",
  //       data: formData,
  //       success: function(res) {
  //         console.log(res)
  //         var prepay_id = that.getXMLNodeValue('prepay_id', res.data.toString("utf-8")).split('[')[2].split(']')[0]
  //         console.log("微信预付单号 = " + prepay_id) //获取微信预付单号
  //         reslove(prepay_id) 
  //       },
  //       fail: function(e) {
  //         reject(e)
  //       },
  //     })
  //   })
  // },

   // //解析xml
  // getXMLNodeValue: function(node_name, xml) {
  //   var tmp = xml.split("<" + node_name + ">")
  //   var _tmp = tmp[1].split("</" + node_name + ">")
  //   return _tmp[0]
  // },