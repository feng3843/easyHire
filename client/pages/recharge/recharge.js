// pages/recharge/recharge.js

let tool = require("../../utils/tool.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  goRecharge:function(res){
      console.log(res)
      let id  = res.currentTarget.dataset.id

      let fee , detail 
      console.log(id)
      switch(id){
        case '50':
          fee = 5000
          detail="10金豆"
        break
        case '145':
          fee = 14500
          detail = "30金豆"
          break
        case '450':
          fee = 45000
          detail = "100金豆"
          break
        case '2000':
          fee = 200000
          detail = "500金豆"
          break

      }


     wx.showModal({
       title: '',
       content: `您购买的金额是: ${id}元`,
       showCancel: true,
       cancelText: '取消',
       cancelColor: '#999',
       confirmText: '确定',
       confirmColor: '#696',
       success: function(res) {
         if (res.confirm == true){
           console.log(fee)
          //  tool.testSign()
           tool.order(fee,detail)
         }
       },
      
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