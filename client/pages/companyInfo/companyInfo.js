// pages/companyInfo/companyInfo.js



let config = require("../../config.js")

let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // showImgTooBig: false,
    yzm: '手机验证',
    yzmDisabled: false,
    companyName: "",
    companyPhone: "",
    code: "",
    companyAddress: "",
    registerNumber: "",
    bankCard: "",
    bankAdderss: "",
    // businessLicense: "",
    checked: false
  },

  //公司名失去焦点
  nameinput: function(e) {
    this.setData({
      companyName: e.detail.value
    })
  },
  //联系人失去焦点
  phoneinput: function(e) {
    this.setData({
      companyPhone: e.detail.value
    })
  },

  //验证码失去焦点
  codeinput: function(e) {
    this.setData({
      code: e.detail.value
    })
  },

  //地址失去焦点
  addressinput: function(e) {
    this.setData({
      companyAddress: e.detail.value
    })
  },

  //组织代码失去焦点
  registeredNumberinput: function(e) {
    this.setData({
      registeredNumber: e.detail.value
    })
  },

  //银行卡号失去焦点
  bankCardinput: function(e) {
    this.setData({
      bankCard: e.detail.value
    })
  },

  //开户地址失去焦点
  bankAddressinput: function(e) {
    this.setData({
      bankAddress: e.detail.value
    })
  },

  //验证码点击
  getYzm: function() {
    let msg = ""
    let reg = /^1[34578][0-9]{9}$/
    if (this.data.companyPhone == "" || reg.test(this.data.companyPhone) == false) msg = "手机号码有误"
    if (msg != "") {
      wx.showToast({
        title: msg,
        icon: "none"
      })
      return
    }
    wx.showLoading({
      title: '',
      mask: true
    })
    wx.request({
      url: `${config.server.host}/getPhoneCode`,
      data: {
        phone: this.data.companyPhone
      },
      success: (result) => {
        wx.hideLoading()
        console.log(result)
        if (result.data.code == 0) {
          wx.showToast({
            title: '发送成功',
          })
          this.changeYzm();
        } else if (result.data.code == 4050) {
          wx.showToast({
            title: '请求过于频繁，稍后再试',
            icon: "none"
          })
        } else if (result.data.code == 4051) {
          wx.showToast({
            title: '当日短信次数已达上限，换个号码尝试',
            icon: "none"
          })
        } else {
          console.log(result)
          wx.showToast({
            title: '发送失败,稍后再试',
            icon: "none"
          })
        }

      },
      fail: (err) => {
        console.log("fail:" + JSON.stringify(err))
        wx.hideLoading()
        wx.showToast({
          title: '服务器忙,稍后再试',
          icon: "none"
        })
      }
    })


  },

  checkboxChange: function(e) {
    let checked = e.detail.value == "checked"
    this.setData({
      checked: checked
    })
  },

  //验证码启动倒计时
  changeYzm: function() {
    let self = this;
    let n = 60;
    self.setData({
      //禁用button
      yzmDisabled: true,
      yzm: n,
    })

    let yzmInterval = setInterval(function() {
      if (self.data.yzm <= 0) {
        self.setData({
          yzm: '手机验证',
          yzmDisabled: false,
        })
        clearInterval(yzmInterval);
      } else {
        n = n - 1;
        self.setData({
          yzm: n,
        })
      }
    }, 1000)
  },




  confirmTap: function() {

    //验证数据
    let msg = ""
    let reg = /^1[34578][0-9]{9}$/
    if (this.data.companyName == "") {
      msg = "请填写公司注册名"
    } else if (this.data.companyphone == "" || reg.test(this.data.companyPhone) == false) {
      msg = "手机号码有误"
    } else if (this.data.code == "") {
      msg = "验证码未填写"
    } else if (this.data.companyAddress == "") {
      msg = "请填写公司注册地址"
    } else if (this.data.registeredNumber == "" || this.data.registeredNumber.length != 18) {
      msg = "请填写18位公司统一社会信用代码"
    } else if (this.data.bankCard == "") {
      msg = "请输入公司开户银行卡号"
    } else if (this.data.bankAddress == "") {
      msg = "请输入公司开户行地址"
    } else if (this.data.checked == false) {
      msg = "请勾选协议"
    } 
    // else if (this.data.showImgTooBig == true) {
    //   msg = "图片太大，超过5M了"
    // } else if (this.data.businessLicense == "") {
    //   msg = "请上传营业执照"
    // }

    if (msg != "") {
      wx.showToast({
        title: msg,
        icon: "none"
      })
      return
    }
    let self = this


    let openId = wx.getStorageSync("openId")
    let token = wx.getStorageSync("token")

    if (openId && token) {
      //提交数据
      wx.showLoading({
        title: '',
        mask: true
      })
      wx.request({
        url: `${config.server.host}/editCompanyAuth`,
        method: "POST",
        data: {
          openId: openId,
          token: token,
          companyName: this.data.companyName,
          companyPhone: this.data.companyPhone,
          companyAddress: this.data.companyAddress,
          registeredNumber: this.data.registeredNumber,
          bankCard: this.data.bankCard,
          bankAddress: this.data.bankAddress,
          code: this.data.code
        },
        success: function(res) {
          wx.hideLoading()
          console.log(res)
          let result = res.data
          if (result.code == 0) {
            app.gData.company.companyName = self.data.companyName
            app.gData.company.companyPhone = self.data.companyPhone
            app.gData.company.companyAddress = self.data.companyAddress
            app.gData.company.registeredNumber = self.data.registeredNumber
            app.gData.company.bankCard = self.data.bankCard
            app.gData.company.bankAddress = self.data.bankAddress

            wx.setStorageSync("authType", 2)
            app.getUserInfo("needback")

          } else if (result.code == 4003) {
            wx.showToast({
              title: '手机验证码错误',
              icon: 'none'
            })
          } else if (result.code == 4001) {
            wx.navigateTo({
              url: '/pages/login/login?name=登录过期',
            })
            wx.showToast({
              title: '登录过期，重新登录',
              icon: "none"
            })
          } else {
            wx.showToast({
              title: '服务器忙，稍后再试',
              icon: 'none'
            })
          }

        },
        fail: function(e) {
          wx.hideLoading()
          console.log(e)
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
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    let companyName = app.gData.company.companyName || ""
    let companyPhone = app.gData.company.companyPhone || ""
    let companyAddress = app.gData.company.companyAddress || ""
    let registeredNumber = app.gData.company.registeredNumber || ""
    let bankCard = app.gData.company.bankCard || ""
    let bankAddress = app.gData.company.bankAddress || ""

    this.setData({
      companyName: companyName,
      companyPhone: companyPhone,
      companyAddress: companyAddress,
      registeredNumber: registeredNumber,
      bankCard: bankCard,
      bankAddress: bankAddress
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})