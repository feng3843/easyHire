// pages/userInfo/registe/registe.js

const config = require("../../config.js")
const app = getApp()


let _heightarray = ["请选择身高", "150 CM以下"]
for (let i = 150; i < 200; i += 5) {
  _heightarray.push(i + "CM - " + (i + 5) + " CM")
}
_heightarray.push("200CM 以上")

let _weightarray = ["请选择体重", "45 Kg以下"]
for (let i = 45; i < 100; i += 5) {
  _weightarray.push(i + "Kg - " + (i + 5) + " Kg")
}
_weightarray.push("100Kg 以上")

let mydate = new Date()
let year = parseInt(mydate.getFullYear())-18
let month = mydate.getMonth()+1
let day = mydate.getDate()
mydate = year + "-" + month + "-" +day
console.log("mydate  " + mydate)



Page({

  /**
   * 页面的初始数据
   */
  data: {
    yzm: '手机验证',
    yzmDisabled: false,
    sexindex: 0,
    sexarray: ["请选择性别", "男", "女"],
    heightindex: 0,
    heightarray: _heightarray,
    weightindex: 0,
    weightarray: _weightarray,
    pick_date: "请选择出生日期",
    nowDate: mydate,
    code: "",
    name: "",
    phone: "",
    birthday: "",   
    sex: "",
    height: "",
    weight: "",
    targetCity:"",
    address:"",
    checked:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    

    let _birthday = app.gData.person.birthday || "",
      _name = app.gData.person.name ||"",
      _phone = app.gData.person.phone||"",
      _sex = app.gData.person.sex||"",
      _height = app.gData.person.height||"",
      _weight = app.gData.person.weight|| "",
      _targetCity = app.gData.person.targetCity||"",
      _address = app.gData.person.address|| ""
    this.setData({
      name: _name,
      sex: _sex,
      phone: _phone,
      height: _height,
      weight: _weight,
      birthday: _birthday,
      targetCity: _targetCity,
      address: _address
    })

  },

  onShow: function (options){
    console.log("app.gData = " + JSON.stringify(app.gData))

    let that = this
    wx.authorize({
      scope: 'scope.userLocation',
      success() {
        that.setData({ userLocationAuth: true })
      },
      fail: function (e) {
        // 右上角菜单 ->关于（小程序名字）->右上角菜单 ->设置
        that.setData({ userLocationAuth: false })
      }
    })


    let selCity = app.selCity||""

    if (selCity){
      this.setData({
        targetCity: selCity
      })
    }
    
   
  },


  checkboxChange:function(e){
    let checked = e.detail.value == "checked"
    this.setData({ checked: checked})
  },

  //提交按钮
  confirmTap: function () {
    //验证数据
    let msg = ""
    let reg = /^1[34578][0-9]{9}$/
    if (this.data.name == "") {msg = "请填写名字"}
    else if (this.data.name.length > 4) {msg = "名字长度超过4个字啦"}
    else if (this.data.phone == "" || reg.test(this.data.phone) == false) {msg = "手机号码有误"}
    else if (this.data.code == "") {msg = "验证码未填写"}
    else if (this.data.sex == "") { msg = "请选择性别" }
    else if (this.data.birthday == "") { msg = "请选择生日" }
    else if (this.data.height == "") { msg = "请选择身高" }
    else if (this.data.weight == "") { msg = "请选择体重" }
    else if (this.data.targetCity == "") {msg = "请选择城市"}
    else if (this.data.address == "") {msg = "请选择现居地址"}
    else if (this.data.checked == false) {msg = "请勾选协议"}
    if (msg != "") {
      wx.showToast({
        title: msg,
        icon: "none"
      })
      return
    }
    let self = this
    //提交数据
    wx.showLoading({
      title: '',
      mask: true
    })


    let openId = wx.getStorageSync("openId")
    let token = wx.getStorageSync("token")

    wx.request({
      url: `${config.server.host}/editPersonalAuth`,
      method:"POST",
      data:{
        openId:openId,
        token:token,
        name:self.data.name,
        sex:self.data.sex,
        height: self.data.height,
        weight: self.data.weight,
        birthday: self.data.birthday,
        targetCity: self.data.targetCity,
        phone: self.data.phone,
        code: self.data.code,
        address: self.data.address
      },
      success:(res)=>{
        wx.hideLoading()
        console.log(res)
        if(res.data.code == 0){

          app.gData.person.name = self.data.name
          app.gData.person.phone = self.data.phone
          app.gData.person.sex = self.data.sex
          app.gData.person.birthday = self.data.birthday
          app.gData.person.height = self.data.height
          app.gData.person.weight = self.data.weight
          app.gData.person.targetCity = self.data.targetCity
          app.gData.person.address = self.data.address

          wx.setStorageSync("authType", 1)
          app.getUserInfo("needback")
        } else if (res.data.code == 4003){
          wx.showToast({
            title: '手机验证码错误',
            icon: 'none'
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
            icon: 'none'
          })
        }
        
      },
      fail:(err)=>{
        wx.hideLoading()
        wx.showToast({
          title: '服务器忙，稍后再试',
          icon:'none'
        })
      }
      
      })

  },


  //名字输入
  nameinput: function (e) {
    this.setData({ name: e.detail.value })
  },

  //电话
  phoneinput: function (e) {
    this.setData({ phone: e.detail.value })
  },

  //验证码
  codeinput: function (e) {
    this.setData({ code: e.detail.value })
  },

  //身高picker
  bindPickerChangeheight: function (e) {
    if (e.detail.value == 0) return
    this.setData({ heightindex: e.detail.value, height: this.data.heightarray[e.detail.value] })
  },

  //体重picker
  bindPickerChangeweight: function (e) {
    if (e.detail.value == 0) return
    this.setData({ weightindex: e.detail.value, weight: this.data.weightarray[e.detail.value] })
  },

  //性别picker
  bindPickerChangesex: function (e) {
    if (e.detail.value == 0) return
    this.setData({ sexindex: e.detail.value, sex: this.data.sexarray[e.detail.value] })
  },

  //生日picker
  bindPickerChangebirthday: function (e) {
    this.setData({ birthday: e.detail.value })
  },

  //期望城市
  selectCity: function (e) {
    wx.navigateTo({
      url: '/pages/city/city',
    })
  },

  //验证码点击
  getYzm: function () {
    let msg = ""
    let reg = /^1[34578][0-9]{9}$/
    if (this.data.phone == "" || reg.test(this.data.phone) == false) msg = "手机号码有误"
    if (msg != "") {
      wx.showToast({
        title: msg,
        icon: "none"
      })
      return
    }
    wx.showLoading({
      title: '',
      mask:true
    })
    wx.request({
      url: `${config.server.host}/getPhoneCode`,
      data:{
        phone: this.data.phone
      },
      success:(result)=>{
        wx.hideLoading()
        if (result.data.code == 0){
          wx.showToast({
            title: '发送成功',
          })
          this.changeYzm();
        } else if (result.data.code == 4050){
          wx.showToast({
            title: '请求过于频繁，稍后再试',
            icon: "none"
          })
        } else if (result.data.code == 4051) {
          wx.showToast({
            title: '当日短信次数已达上限，换个号码尝试',
            icon: "none"
          })
        }else{
          console.log(result)
          wx.showToast({
            title: '发送失败,稍后再试',
            icon: "none"
          })
        }
          
      },
      fail:(err)=>{
        console.log("fail:"+JSON.stringify(err))
        wx.hideLoading()
          wx.showToast({
            title: '服务器忙,稍后再试',
            icon: "none"
          })
      }
    })
    

  },


  //验证码启动倒计时
  changeYzm: function () {
    let self = this;
    let n = 60;
    self.setData({
      //禁用button
      yzmDisabled: true,
      yzm: n,
    })

    let yzmInterval = setInterval(function () {
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


  selectAddress:function (){
    let that = this
    wx.chooseLocation({
      success: function (e) {
        console.log(e)
        console.log(e.name)
        that.setData({ address: e.address || e.name })
      },
      fail: function (r) {
        console.log(r)
      }
    })
  }
})