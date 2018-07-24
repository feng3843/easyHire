// pages/staffDetail/staffDetail.js


let config = require("../../config.js")
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
    let userID = options.userId
    console.log("useID" + userID)
    this.setData({userID:userID})

   
  },

  callPhoneNumber:function(e){
    let phone = this.data.user.phone
    wx.makePhoneCall({
      phoneNumber:phone
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    if (!this.data.userID) { return }
    wx.showLoading({
      title: '',
      mask: true
    })

    wx.request({
      url: `${config.server.host}/checkPersonalDetail`,
      method: "POST",
      data: {
        token: wx.getStorageSync("token"),
        openId: wx.getStorageSync("openId"),
        userId: that.data.userID
      },
      success: function (res) {
        wx.hideLoading()
        console.log(res)

        if (res.data.code == 0) {
          let user = res.data.result
          user.age = parseInt(new Date().getFullYear()) - parseInt(user.birthday)

          that.setData({ user: user })
        } else if (res.data.code == 4001) {

          wx.navigateTo({
            url: '/pages/login/login?name=登录过期',
          })
          wx.showToast({
            title: '登录过期，重新登录',
            icon: "none"
          })
        } 

        
      },
      fail: function (e) {
        wx.hideLoading()
        console.log(e)
      }
    })
  },





  checkPhone:function(){
    let that = this
    let authType = wx.getStorageSync("authType")
    if (authType !=2){
      wx.showToast({
        title: '只有公司认证后的用户才能查看',
        icon: "none"
      })
      return
    }

    let checkTimes = app.gData.company.checkTimes || 0

    wx.showModal({
      title: '购买',
      content: `将消耗一颗金豆,账户剩余:${checkTimes}`,
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000',
      confirmText: '确定',
      confirmColor: '#696',
      success: function(res) {
        console.log("success"+  JSON.stringify( res))
        if(res.confirm == true){
          that.buyContactInformation()
        }
      },
      fail: function(res) {
        console.log("fail" + JSON.stringify(res))

      },

    })
  },



  buyContactInformation: function() {

    let that = this
    let openId = wx.getStorageSync("openId")
    let token = wx.getStorageSync("token")

    if(openId && token){
      wx.showLoading({
        title: '',
        mask: true
      })

      wx.request({
        url: `${config.server.host}/buyContactInformation`,
        data: {
          token: token,
          openId: openId,
          userId: that.data.userID
        },
        method: 'POST',
        success: function (res) { 
          console.log(res)
          wx.hideLoading()
          if (res.data.code == 0) {
            let user = that.data.user
            console.log("user = " + JSON.stringify(user) )
            user.phone = res.data.result.phone
            user.isbought = 1
            that.setData({
               user: user
            })
            app.gData.company.checkTimes -= 1
            console.log("user = " + JSON.stringify(user))
          } else if (res.data.code == 4001) {
            wx.navigateTo({
              url: '/pages/login/login?name=登录过期',
            })
            wx.showToast({
              title: '登录过期，重新登录',
              icon: "none"
            })
          } else if (res.data.code == 4005) {
            wx.showToast({
              title: '购买余额不足，请充值',
              icon: "none"
            })
          } else {
            wx.showToast({
              title: '服务器忙，稍后再试',
              icon: "none"
            })
          }
        },
        fail: function (res) { },

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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})