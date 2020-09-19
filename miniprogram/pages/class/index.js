// pages/class/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classData:[],
    isDetail:"none",
    currentDetail:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _data = [];
    let _this = this;
    //获取设备高度，实现卡片高度自适应
    wx.getSystemInfo().then((res)=>{
      const rpxHeight = Math.floor(750 / res.windowWidth * res.windowHeight);
      _this.setData({swiperHeight: rpxHeight});
    });
    wx.getStorage({
      key: 'student',
    }).then((res)=>{
      //获取数据
      wx.getStorage({
        key: 'classData',
      }).then((res)=>{
        console.log("get data from localstorage")
        //本地缓存直接取
        _this.setData({classData:res.data})
      }).catch(()=>{
        //无缓存上数据库取
        console.log("get data from datebase")
        this.getData(res.data.stuAccount).then((data)=>{
          data.forEach((t)=>{
              let temp = [];
              for(let i in t){
                t[i].forEach((j)=>{
                  temp.push(j);
                })
              }
              _data.push(temp);
          });
          console.log(_data);
          _this.setData({classData:_data})
          wx.setStorage({
            data: _data,
            key: 'classData',
          })
        });
      })
    }).catch(()=>{
      wx.reLaunch({
        url: '/pages/index/index',
      })
    })
  },
  getData:function(id){
    const DB = wx.cloud.database({
      env: 'chanx-server'
    });
    const _ = DB.command;
    const classData = DB.collection('classData');

    return new Promise((resolve,reject)=>{
      classData.doc(id).get().then((res)=>{
        console.log(JSON.parse(res.data.class).slice(1))
        resolve(JSON.parse(res.data.class).slice(1));
      }).catch(()=>{
        reject();
      })
    });
  },
  showDetail:function(e){
    if(e.target.id != "detailWindow")
    this.setData({isDetail:this.data.isDetail == "block"?"none":"block",currentDetail:{}});
  },
  showWindow:function(e){
    console.log(e)
    this.setData({currentDetail:e.currentTarget.dataset.item,isDetail:"block"});
  }
})