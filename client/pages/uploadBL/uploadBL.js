// pages/uploadBL/uploadBL.js

let app = getApp()
let config = require("../../config.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: false,
    businessLicense : "",
    imageUrl:""
  },


  chooseImageTap: function(e) {
    let _this = this
    wx.showActionSheet({
      itemList: ['相册选取', '拍照'],
      itemColor: "#f7982a",
      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            _this.chooseWxImage('album')
          } else if (res.tapIndex == 1) {
            _this.chooseWxImage('camera')
          }
        }
      },
    })
  },

  chooseWxImage: function(type) {
    let _this = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function(res) {
        console.log(res);
        let showImgTooBig = res.tempFiles[0].size > 5 * 1024 * 1024
        _this.setData({
          businessLicense: res.tempFilePaths[0],
          imageUrl: res.tempFilePaths[0],
          showImgTooBig: showImgTooBig
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


  confirmTap: function(e) {
    let msg = ""
    if (this.data.businessLicense == "") {
      msg = "请选择营业执照图片"
    } else if (this.data.showImgTooBig == true) {
      msg = "图片太大，超过5M了"
    } else if (this.data.checked == false) {
      msg = "请勾选协议"
    } 

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
      wx.showLoading({
        title: '',
        mask: true
      })

      wx.uploadFile({
        url: `${config.server.host}/uploadBL`,
        filePath: self.data.businessLicense,
        name: app.gData.company.companyName,
        header: {
          'content-type': 'multipart/form-data'
        },
        formData: {
          openId: openId,
          token: token
        },
        success: function(res) {
          console.log(res)
          let result = JSON.parse(res.data)
          wx.hideLoading()
          if (result.code == 0){
            wx.showToast({
              title: '上传成功',
              icon: "none"
            })
            app.gData.needPullDownRefresh = true
            setTimeout(()=>{wx.navigateBack({})},1500)
          } else if (result.code == 4001){
            wx.navigateTo({
              url: '/pages/login/login?name=登录过期',
            })
            wx.showToast({
              title: '登录过期，重新登录',
              icon: "none"
            })
          }

        },
        fail: function(res) {
          console.log(res)
          wx.hideLoading()
          wx.navigateTo({
            url: '/pages/login/login?name=登录过期',
          })
          wx.showToast({
            title: '登录过期，重新登录',
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let src = app.gData.company.businessLicense||""
    if(src){
      let imageUrl = `https://www.shouhutianshi.cn${src}`
      console.log(imageUrl)
      this.setData({
        imageUrl: imageUrl
      })
    }
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