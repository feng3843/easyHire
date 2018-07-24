// pages/userInfo/userInfo.js
let app = getApp()
let config = require("../../config.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  goRecharge:function(){
    console.log("区充值")
    wx.navigateTo({
      url: '/pages/recharge/recharge',
    })
  },

  uploadBusinessLicense:function(e){
      console.log("上传营业执照")
      wx.navigateTo({
        url: '/pages/uploadBL/uploadBL',
      })
  },

//打开or关闭一键求职
  tapImg: function (e) {
    let that = this
    let isfinding = this.data.isfinding == 0 ? 1 : 0
    wx.showLoading({
      title: '',
      mask: true
    })

    let openId = wx.getStorageSync("openId")||""
    let token = wx.getStorageSync("token")||""
    if (openId && token) {
      wx.request({
        url: `${config.server.host}/changeStatus`,
        method: "POST",
        data: {
          openId: openId,
          token: token,
          isfinding: isfinding
        },
        success: (res) => {
          wx.hideLoading()
          console.log(res)
          if (res.data.code == 0) {
            wx.showToast({
              title: '操作成功'
            })
            that.setData({ isfinding: isfinding })
            app.gData.person.isfinding = isfinding
          } else if (res.data.code == 4001) {
            wx.navigateTo({
              url: '/pages/login/login?name=登录过期',
            })
            wx.showToast({
              title: '登录过期，重新登录',
              icon: "none"
            })
          } else if (res.data.code == 4002) {

            wx.switchTab({
              url: '/pages/userInfo/userInfo',
            })
            wx.showToast({
              title: '请先完善信息吧',
              icon: "none",
            })

          }

        },
        fail: (err) => {
          wx.hideLoading()
          wx.showToast({
            title: '服务器忙，稍后再试',
            icon: "none"
          })
        }
      })
    } else {
      wx.hideLoading()
      wx.switchTab({
        url: '/pages/userInfo/userInfo',
      })
      wx.showToast({
        title: '请先登录并完善信息吧',
        icon: "none",
        duration: 2000
      })

    }




  },

  editInfo:function(){
    console.log(this.data.authType)

    if (this.data.authType == 1){
      wx.navigateTo({
        url: '/pages/personInfo/personInfo',
      })
    } else if (this.data.authType == 2){
      wx.navigateTo({
        url: '/pages/companyInfo/companyInfo',
      })
    }
    
  },


  hrCkeckedLog:function(e){
    wx.navigateTo({
      url: '/pages/hrLogs/hrLogs',
    })
  },



  personAuth:function(){
    wx.navigateTo({
      url: '/pages/personInfo/personInfo',
    })
  },

  companyAuth: function () {
    wx.navigateTo({
      url: '/pages/companyInfo/companyInfo',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

    setTimeout(function(){
      that.UIsetData()
    },200)

    if (app.gData.needPullDownRefresh){
      that.onPullDownRefresh()
    }

  },


  UIsetData:function(){
    console.log("userINfo onShow that.gData = " + JSON.stringify(app.gData))
    let avatarUrl = wx.getStorageSync("avatarUrl") || "/images/avatar.png"
    let nickName = wx.getStorageSync("nickName") || ""
    let authType = wx.getStorageSync("authType") || 0

    this.setData({ avatarUrl: avatarUrl, nickName: nickName, authType: authType })

    if (authType == 1) {
      console.log("gData refreshTimes= " + app.gData.person.refreshTimes)
      let isfinding = app.gData.person.isfinding || 0
      let refreshTimes = app.gData.person.refreshTimes || 0
      let rank = app.gData.person.rank || 1
      this.setData({ isfinding: isfinding, refreshTimes: refreshTimes, rank: rank })
    } else if (authType == 2) {
      let checkTimes = app.gData.company.checkTimes || 0
      this.setData({ checkTimes: checkTimes })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.selCity = app.gData.person.targetCity||""
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  /**
   * 置顶简历
   */
  refreshResume: function () {
    let that = this
    wx.showLoading({
      title: '',
      mask: true
    })

    let openId = wx.getStorageSync("openId")
    let token = wx.getStorageSync("token")
    if (openId && token) {
      wx.request({
        url: `${config.server.host}/refreshResume`,
        method: "POST",
        data: {
          openId: openId,
          token: token,
        },
        success: (res) => {
          wx.hideLoading()
          console.log(res)
          if (res.data.code == 0) {
            wx.showToast({
              title: '置顶成功'
            })
            that.setData({ rank: res.data.result.index })
            app.gData.person.rank = res.data.result.index
            that.setData({ refreshTimes: res.data.result.refreshTimes })
            app.gData.person.refreshTimes = res.data.result.refreshTimes
          } else if (res.data.code == 4001) {

            wx.navigateTo({
              url: '/pages/login/login?name=登录过期',
            })
            wx.showToast({
              title: '登录过期，重新登录',
              icon: "none"
            })

          } else if (res.data.code == 4002) {

            wx.switchTab({
              url: '/pages/userInfo/userInfo',
            })
            wx.showToast({
              title: '请先完善信息吧',
              icon: "none",
            })

          }

        },
        fail: (err) => {
          wx.hideLoading()
          wx.showToast({
            title: '服务器忙，稍后再试',
            icon: "none"
          })
        }
      })
    } else {
      wx.hideLoading()
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh:  function () {
      let that = this 
     app.getUserInfo()
     app.gData.needPullDownRefresh = false
     setTimeout(() => {
       that.UIsetData()
       wx.stopPullDownRefresh()
         }, 1000)
    
  },

  // onPullDownRefresh: async function () {

  //   await app.getUserInfo()

  //  await  this.UIsetData()

  //   wx.stopPullDownRefresh()
  // },


  myCkeckedLog:function(e){
    wx.navigateTo({
      url: '/pages/contactInformationList/contactInformationList',
    })
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