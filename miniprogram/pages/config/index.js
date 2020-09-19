// pages/config/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  refreshClass:function(){
    let _data = [];
    const _this = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.getStorage({
      key: 'student',
    }).then((stu)=>{
      wx.cloud.callFunction({
        // 云函数名称
        name: 'getLogin',
        data: stu.data
      }).then(res => {
        if(res.result.e){
          this.getData(stu.data.stuAccount).then((data)=>{
            data.forEach((t)=>{
                let temp = [];
                for(let i in t){
                  t[i].forEach((j)=>{
                    temp.push(j);
                  })
                }
                _data.push(temp);
            });
            _this.setData({classData:_data})
            wx.setStorage({
              data: _data,
              key: 'classData',
            }).then(()=>{

              wx.switchTab({
                url: '/pages/class/index',
              });
            })
          });
          wx.hideLoading()
        }else{
          wx.hideLoading()
          wx.showToast({
            title: '失败',
            icon: 'none',
            duration: 2000
          })
        }
      }).catch(console.error)
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
  logout:function(){
    wx.clearStorage({
      success: (res) => {
        wx.reLaunch({
          url: '/pages/index/index',
        })
      },
    })
  }
})