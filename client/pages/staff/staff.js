// pages/staff/staff.js

let config = require("../../config.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    personals: [],
    currentPage:1,
    totalPage:1,
    showbottomView:false
  },

  personalCellClick:function(e){
    let userID = e.currentTarget.dataset.person.openId || ""
    if (!userID) {
      console.log("无用户id")
      return
    }

    wx.navigateTo({
      url: `/pages/staffDetail/staffDetail?userId=${userID}`,
    })

    console.log("跳转用户明细页面")

  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.getMoreData(1)
  },

  

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("触发下拉")
    this.setData({
      currentPage: 1,
      totalPage: 1,
      showbottomView: false
      })
    this.getMoreData(1)
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    console.log("触发上拉")

    console.log('hi')
    

    if (this.data.showbottomView == true) {
        return
    }

    if (this.data.loading) return;
    this.setData({ loading: true });

    this.getMoreData(this.data.currentPage + 1)
   
  },
  

  getMoreData:function(page){
    let that = this
    if (page > this.data.totalPage) {
      this.setData({ showbottomView: true })
      return
    }
    wx.showLoading({
      title: '',
      mask:true
    })
     
      wx.request({
        url: `${config.server.host}/getPersonalList`,
        data:{
          page:page
        },
        success:function(res){
          console.log(res)
          wx.hideLoading()
          if (res.data.code == 0){

            let personals = res.data.result.personList

            personals.forEach((item)=>{
              item.age = parseInt(new Date().getFullYear()) - parseInt(item.birthday)
            })

            
            that.setData({
              totalPage: res.data.result.totalPages,
              personals: personals,
              loading: false
            })
          }
          
        },
        fail:function(e){
          wx.hideLoading()
          that.setData({ loading: false});
          console.log(e)
        }
      })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})