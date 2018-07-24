// pages/login/login.js

let tool = require("../../utils/tool.js")
let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({ name:options.name})
  },

  bindgetuserinfo:function(e){
    console.log(e)

    if (e.detail.errMsg.indexOf('auth deny') > -1 || e.detail.errMsg.indexOf('auth denied') > -1) {
      wx.showToast({
        title: '请授权！',
        icon:"none",
        mask:true
      })
    }else{
      wx.getUserInfo({
        success: function (res) {
          console.log(res.userInfo.avatarUrl)
          wx.setStorageSync("avatarUrl", res.userInfo.avatarUrl)
          wx.setStorageSync("nickName", res.userInfo.nickName)
        }
      })
      //授权成功，请求登录
      app.login("needback")
    }
  },

})