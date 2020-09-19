// pages/showNews/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    news:{content:""},
    imgData:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this;
    wx.getStorage({
      key: 'moreNews',
    }).then((res)=>{
      this.setData({news:res.data})
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
    wx.cloud.callFunction({
      name:"getNews",
      success:(res)=>{
        console.log(res.result.e)
      },
      
    })
    const _this = this;
    const DB = wx.cloud.database({
      env: 'chanx-server'
    });
    
    const newsData = DB.collection('newsData');
    
    newsData.orderBy("_id","desc").get().then((res)=>{
      console.log(res.data)
      const content = res.data[0].content;
      _this.setData({content:content});
    })

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

  },
  filesHandler:function(el){
    console.log(el.detail.href)
    wx.showLoading({title: '加载中…'})
    wx.downloadFile({ //下载
      url: el.detail.href,
      success: function(e){
        const filePath = e.tempFilePath; // 临时文件地址
        wx.openDocument({ // 预览
          filePath: filePath,
          success: function (ret) {
            console.log('打开文档成功')
            wx.hideLoading()
          }
        })
      },
      fail: function(r){
        console.log(r)
        wx.hideLoading()
        wx.showToast({
          title: '加载失败...',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})