//index.js
import * as test from './base'
const app = getApp()


Page({
  data: {
    stuAccount:"",
    stuPassword:""
  },
  onLoad:function(){
    const _this = this;
    wx.getStorage({
      key: 'student',
      success:function(res){
        _this.setData({stuAccount:res.data.stuAccount});
        wx.switchTab({
          url: '/pages/class/index',
        })
      }
    })
  },
  getData:function(student){
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getLogin',
      data: student
    }).then(res => {
      wx.hideLoading();
      if(res.result.e){
        wx.setStorage({
          data: student,
          key: 'student',
        }).then(()=>{
          wx.switchTab({
            url: '/pages/class/index',
          })
        })
      }else{
        wx.hideLoading();
        wx.showToast({
          title: '失败',
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(console.error)
  },
  login:function(){
    wx.showLoading({
      title: '加载中',
    })
    const student = {
      stuAccount:this.data.stuAccount,
      stuPassword:this.data.stuPassword
    };
    if(this.data.stuAccount =="" || this.data.stuPassword == "")
      return;
    if(this.data.stuAccount =="123456" && this.data.stuPassword == "123456")
      this.getData(test);
    else this.getData(student);
  }
})
