// pages/showNews/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:[],
    imgData:[],
    nomore:false,
  },
  onLoad:function(){
    this.getdata();
  },
  getdata:function(){
    if(this.data.nomore)
      return;
    const _this = this;
    
    const DB = wx.cloud.database({
      env: 'chanx-server'
    });
    const _ = DB.command;
    const newsData = DB.collection('newsData');
    let id = _this.data.content.length == 0 ? 149569:_this.data.content[_this.data.content.length - 1]["_id"]
    console.log(id)
    wx.showLoading({
      title: '加载中...',
    })
    newsData.orderBy("_id","desc").skip(this.data.content.length).limit(5).get().then((res)=>{
      // console.log(res.data)
      const content = res.data;
      content.forEach((item)=>{
        item.from = item.from.length > 10 ? item.from.substring(0,10) + "···":item.from;
      })
      const newArray = _this.data.content.concat(content);
      console.log(newArray)
      _this.setData({content:newArray,nomore:newArray.length == _this.data.content.length});
      wx.hideLoading();
    })
  },
  onReachBottom: function() {  
    this.getdata();
  },
  goToMore:function(e){
    console.log(e)
    wx.setStorage({
      data: e.currentTarget.dataset.item,
      key: 'moreNews',
    }).then(()=>{
      wx.navigateTo({
        url: 'more',
      })
    })

  }
})