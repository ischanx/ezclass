
const cloud = require('wx-server-sdk');
cloud.init();
const DB = cloud.database({
  env: 'chanx-server'
});
const todos = DB.collection('todos');
// 云函数入口函数
exports.main = async (event, context) => {
  await todos.get().then((res)=>{
    // console.log(JSON.stringify(res));
    e = res;
  })
  return {
    e
  }
}
