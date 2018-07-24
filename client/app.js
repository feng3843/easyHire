//app.js

var flag = false

var config = require('./config')


App({


  gData: {
    person: {},
    company: {}
  },

  selCity: "",

  needPullDownRefresh:false,

  onLaunch: function() {
    //check登录状态
    let that = this
    setTimeout(function() {
      that.checkAuthSetting()
    }, 400)



  },

  //check登录状态
  checkAuthSetting() {
    let that = this
    //检查授权情况
    wx.getSetting({
      success: (e) => {
        console.log(e)
        if (!e.authSetting['scope.userInfo']) {
          console.log("无授权")
          //1.无授权，跳转请求授权界面
          wx.navigateTo({
            url: '/pages/login/login?name=无授权状态',
          })
        } else {
          //2.有授权
          wx.getUserInfo({
            success: function(res) {
              wx.setStorageSync("avatarUrl", res.userInfo.avatarUrl)
              wx.setStorageSync("nickName", res.userInfo.nickName)
            }
          })
          //检查token有效性
          that.checkToken()
        }
      }
    })
  },




  //检查token有效性
  checkToken() {
    let that = this
    //检查本地存储有无token
    let token = wx.getStorageSync("token")
    let openId = wx.getStorageSync("openId")
    console.log("token:" + token)
    if (token && openId) { //本地有token，检查sessionkey（token）是否过期
      wx.checkSession({
        success: function (e) { //token有效，获取个人信息
          console.log("key+token有效期内，获取个人信息")
          that.getUserInfo()
        },
        fail: function(e) {
          //sessionkey过期，token过期，重新登录
          that.login()
        }
      })
    } else { //无token，直接重新登录
      that.login()
    }
  },

  //获取个人信息
  getUserInfo(status) {
    let that = this
    console.log("status" + status)
    let authType = wx.getStorageSync("authType") || 0
    if (!authType) {
      console.log("用户未认证，暂时不读取用户信息")
      if (status == "needback") {
        wx.navigateBack({})
      }
      return
    }
    //上传头像
    that.updateAvatarUrl()
    //获取用户信息
    console.log("获取用户信息")
    wx.showLoading({
      title: '',
      mask: true
    })
    let token = wx.getStorageSync("token")
    let openId = wx.getStorageSync("openId")
    wx.request({
      url: `${config.server.host}/getUserInfo`,
      data: {
        token: token,
        openId: openId
      },
      method: "POST",
      success: function(res) {
        wx.hideLoading()
        console.log(res)
        if (res.data.code == 0) {
          let userinfo = res.data.result
          if (userinfo && authType == 1) { //成功获取个人用户信息

            that.gData.person.userAvatatUrl = userinfo.avatatUrl
            that.gData.person.birthday = userinfo.birthday
            that.gData.person.checkTimes = userinfo.checkTimes
            that.gData.person.height = userinfo.height
            that.gData.person.isfinding = userinfo.isfinding
            that.gData.person.lastRefreshTime = userinfo.lastRefreshTime
            that.gData.person.name = userinfo.name
            that.gData.person.phone = userinfo.phone
            that.gData.person.rank = userinfo.rank
            that.gData.person.refreshTimes = userinfo.refreshTimes
            that.gData.person.sex = userinfo.sex
            that.gData.person.targetCity = userinfo.targetCity
            that.gData.person.weight = userinfo.weight
            that.gData.person.address = userinfo.address

            console.log("that.gData = " + JSON.stringify(that.gData))


          } else if (userinfo && authType == 2) { //成功获取公司用户信息

            // console.log("userinfo = " + JSON.stringify(userinfo))

            that.gData.company.bankAddress = userinfo.bankAddress
            that.gData.company.bankCard = userinfo.bankCard
            that.gData.company.businessLicense = userinfo.businessLicense
            that.gData.company.checkTimes = userinfo.checkTimes
            that.gData.company.companyAddress = userinfo.companyAddress
            that.gData.company.companyName = userinfo.companyName
            that.gData.company.companyPhone = userinfo.companyPhone
            that.gData.company.registeredNumber = userinfo.registeredNumber

            // console.log("that.gData = " + JSON.stringify(that.gData))

          }
          if (status == "needback") {
            wx.navigateBack({})
          }
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
      fail: function(err) {
        wx.hideLoading()
        console.log(err)
        wx.showToast({
          title: '服务器错误，稍后再试',
          icon: "none"
        })
      }
    })

  },

  //登录
  login(status) {
    console.log("status" + status)
    console.log("重新登录")
    let that = this
    wx.login({
      success: function(res) {
        let code = res.code
        wx.showLoading({
          title: '',
          mask: true
        })
        //登录请求
        wx.request({
          url: `${config.server.host}/login`,
          data: {
            code: code,
            grant_type: 'authorization_code'
          },
          method: "POST",
          success: function(res) {
            wx.hideLoading()
            console.log("获取最新的session_key。。。。。。")
            let userinfo = res.data.result
            if (userinfo) {
              console.log(userinfo)
              wx.setStorageSync("token", userinfo.token)
              wx.setStorageSync("openId", userinfo.openId)
              wx.setStorageSync("authType", userinfo.authType)
              that.getUserInfo(status)
            }
          },
          fail: function(err) {
            wx.hideLoading()
            console.log(err)
            wx.showToast({
              title: '服务器错误，稍后再试',
              icon: "none"
            })
          }
        })

      }
    })
  },

  updateAvatarUrl: function(e) {
    if (flag) {
      console.log("头像URL上传过了")
      return
    }

    let openId = wx.getStorageSync("openId") || ""
    let avatarUrl = wx.getStorageSync("avatarUrl") || ""

    if ( !openId || !avatarUrl) {
      console.log("没有openid或者头像URL")
      return
    }

    console.log(avatarUrl)

    wx.request({
      url: `${config.server.host}/updateAvatarUrl`,
      data: {
        openId: openId,
        avatarUrl: avatarUrl
      },
      method: 'POST',
      success: function(res) {
        console.log(res)
        if (res.data.code == 0) {
          console.log("头像URL上传OK")
          flag = true
        }
      },
    })
  },


})