// pages/hrLogs/hrLogs.js

let app = getApp()
let config = require("../../config.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hrLogs:[],
    getResult:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHrLogs()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: async function () {
  //   await this.getHrLogs()
  //   wx.stopPullDownRefresh()
  // }, 
  onPullDownRefresh:  function () {
     this.getHrLogs()
     setTimeout(() => { wx.stopPullDownRefresh()},2000)
  },

  getHrLogs: function(e){
    let that = this
    let openId = wx.getStorageSync("openId")
    let token = wx.getStorageSync("token")

    if(openId && token){
        wx.showLoading({
          title: '',
          mask:true
        })

        wx.request({
          url: `${config.server.host}/checkLogs`,
          data: {
            openId: openId,
            token: token
          },
          method: 'POST',
          success: function (res) { 
            console.log(res)
            wx.hideLoading()
            if (res.data.code == 0){
              that.setData({
                hrLogs:res.data.result,
                getResult:true
              })
            }else if (res.data.code == 4001) {
              wx.navigateTo({
                url: '/pages/login/login?name=登录过期',
              })
              wx.showToast({
                title: '登录过期，重新登录',
                icon: "none"
              })
            }else{
              wx.showToast({
                title: '服务器忙，稍后再试',
                icon: "none"
              })
            }
          },
          fail: function (res) { 
            console.log(res)
            wx.hideLoading()
            wx.showToast({
              title: '服务器忙，稍后再试',
              icon: "none"
            })

          },

        })


    }else{
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})