//index.js
const app = getApp()


Page({
  data: {
      winWidth: 0,
      winHeight: 0,
      currentTab: 1,
      todolist:[],
      isEdit:"none",
      description:""
  },
  onLoad: function() {
      var that = this;
      /**
       * 获取当前设备的宽高
       */
      wx.getSystemInfo( {
          success: function( res ) {
              that.setData( {
                  winWidth: res.windowWidth,
                  winHeight: res.windowHeight
              });
          }
      });
  },
  onShow:function(){
    this.getData();
  },
  getData:function(){
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getTodoList',
    }).then(res => {
      console.log(res.result.e.data); // 3
      this.setData({
        todolist:res.result.e.data
      });
    }).catch(console.error)
  },
//  tab切换逻辑
  swichNav: function( e ) {
      var that = this;
      if( this.data.currentTab === e.target.dataset.current ) {
          return false;
      } else {
          that.setData( {
              currentTab: e.target.dataset.current
          })
      }
  },
  bindChange: function( e ) {
      var that = this;
      that.setData( { currentTab: e.detail.current });

  },
  longPressHandler:function(e){
    const item = e.currentTarget.dataset.item;
    this.setData({description:item.description,isEdit:"block"});
  },
  changeItemStatus:function(e){
    const id = e.currentTarget.dataset.item._id;
    const _this =this;
    wx.cloud.callFunction({
      name:"setTodoItem",
      data:{
        id:id,
        done:!e.currentTarget.dataset.item.done,
      },
      success:function(res){
        _this.getData();
      }
    })
    console.log(e)
  },
  showEditPage:function(){
    console.log("change")
    this.setData({isEdit:this.data.isEdit == "block"?"none":"block"});
  },
  addTodoItem:function(){
    const _this =this;
    if(this.data.description == "")
      return;
    wx.cloud.callFunction({
      name:"addTodoItem",
      data:{
        description:this.data.description,
        done:false,
      },
      success:function(res){
        _this.getData();
        _this.setData({description:"",isEdit:"none"});
      }
    })
  }
})