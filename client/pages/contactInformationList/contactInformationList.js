// pages/contactInformationList/contactInformationList.js

let app = getApp()
let config = require("../../config.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    CIList:[],
    getResult:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCIList()
  },

  personalCellClick:function(e){
    
    let jsonstr = JSON.stringify(e.currentTarget.dataset.person)
    let espStr = escape(jsonstr) 

    wx.navigateTo({
      url: `/pages/contactInformationDetail/contactInformationDetail?contactInformation=${espStr}`,
    })
  },

  getCIList:function(e){
    let that = this
    let openId = wx.getStorageSync("openId")
    let token = wx.getStorageSync("token")

    if (openId && token) {
      wx.showLoading({
        title: '',
        mask: true
      })

      wx.request({
        url: `${config.server.host}/contactInformationList`,
        data: {
          token: token,
          openId: openId
        },
        method: 'POST',
        success: function (res) {
          console.log(res)
          wx.hideLoading()
          if (res.data.code == 0) {
            
            console.log(res)
            let CIList = res.data.result
            CIList.forEach((item) => {
              item.age = parseInt(new Date().getFullYear()) - parseInt(item.birthday)
            })
           
            that.setData({
              CIList: CIList,
              getResult:true
            })
            
          } else if (res.data.code == 4001) {
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
              icon: "none"
            })
          }
        },
        fail: function (res) { 
          wx.hideLoading()
          wx.showToast({
            title: '服务器忙，稍后再试',
            icon: "none"
          })
        },

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: async function () {
  //  await this.getCIList()
  //  wx.stopPullDownRefresh()
  // },
  onPullDownRefresh:  function () {
     this.getCIList()
     setTimeout(() => { wx.stopPullDownRefresh() }, 2000)
  },

  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})