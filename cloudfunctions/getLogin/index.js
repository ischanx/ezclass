
const axios = require('axios');
const util = require("util");
const cheerio = require("cheerio");
const cloud = require('wx-server-sdk');
cloud.init();
const DB = cloud.database({
  env: 'chanx-server'
});
const cookies = DB.collection('cookies');
const classData = DB.collection('classData');

function updateData(data,stuAccount){
  let newData = [];
  for(let i = 0;i <= 20;i++){
    newData.push({});
  }
  let colors = {};
  Array.isArray(data)&&data.forEach((item) =>{
      if(!newData[item.zc][item.xq]){
        newData[item.zc][item.xq] = [];
      }
      item.top = parseInt(item.jcdm.slice(0,2));
      item.height = item.jcdm.length/2;
      if(!colors[item.kcmc]){
        colors[item.kcmc] =  'rgb(' +
        Math.round(Math.random() * 255) +
        ',' +
        Math.round(Math.random() * 255) +
        ',' +
        Math.round(Math.random() * 255) +
        ',' + '0.8)';
      }
      item.color = colors[item.kcmc];
      item.name =  item.kcmc.length > 5 ?item.kcmc.slice(0,6) +"…":item.kcmc;
      newData[item.zc][item.xq].push(item);
  })
  console.log(newData);
  classData.add({
    data:{
      _id: stuAccount,
      class: JSON.stringify(newData)
    }
  }).then((res)=>{
    console.log(res);
  }).catch((err)=>{
    classData.doc(stuAccount).update({
      data:{
        class: JSON.stringify(newData)
      }
    })
  })
}
// 云函数入口函数
exports.main = async (student,event, context) => {
  const {stuAccount,stuPassword} = student;
  let e = {};
  let obj ={};
  let cookie = "";
  let formdata = "";
  if(cookie == ""){
    await axios.request({
      url:"http://authserver.gdut.edu.cn/authserver/login?service=http%3A%2F%2Fjxfw.gdut.edu.cn%2Fnew%2FssoLogin",
      method:'get',
      headers:{"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"}
    }).then((res)=>{
      let data = eval (util.inspect(res.data));
      cookie = eval(util.inspect(res.headers["set-cookie"][0]));
      console.log(cookie)
      const $ = cheerio.load(data);
      $("#casLoginForm input").each((index,item)=>{
        let val = null;
        if(index > 6)
          return;
        if(item.attribs.name.includes("username")){
          val = stuAccount;
        }else if(item.attribs.name.includes("password")){
          val = stuPassword;
        }
        obj[item.attribs.name] = val? val : item.attribs.value;
      })
      for(let i in obj){
        formdata += encodeURIComponent(i) + "="+encodeURIComponent(obj[i]) + "&";
      }
      console.log(obj)
    })
    let loc = "";
    await axios.request({
      url:"http://authserver.gdut.edu.cn/authserver/login?service=http%3A%2F%2Fjxfw.gdut.edu.cn%2Fnew%2FssoLogin",
      method:'post',
      data: formdata,
      maxRedirects: 0,//禁止重定向
      headers:{"Cookie":cookie + " Domain=news.gdut.edu.cn;","Content-Type": "application/x-www-form-urlencoded"
      ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
      ,"Connection": "keep-alive"
      ,"Origin": "http://authserver.gdut.edu.cn"
      ,"Host": "authserver.gdut.edu.cn"
      ,"accept":"*/*"}
    }).then((res)=>{
      // console.log(res);
    }).catch((err)=>{
      // console.log("err",err.response)
      loc = util.inspect(err.response.headers.location).replace(/'/g,"");
      console.log(loc)
    })

    if(loc != "")
    await axios.request({
      url:loc,
      method:'get',
      maxRedirects:0,
      headers:{"Cookie":cookie
      ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
      ,"Connection": "keep-alive"
      ,"Host": "jxfw.gdut.edu.cn"
      ,"accept":"*/*"}
    }).then((res)=>{
      // console.log(res);
    }).catch((res)=>{
      // console.log("err2",res.response)
      loc = util.inspect(res.response.headers.location).replace(/'/g,"");
      console.log(loc)
    })

    if(loc != "")
    await axios.request({
      url:loc,
      method:'get',
      maxRedirects:0,
      headers:{"Cookie":cookie
      ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
      ,"Connection": "keep-alive"
      ,"Host": "jxfw.gdut.edu.cn"
      ,"accept":"*/*"}
    }).then((res)=>{
      // console.log(res);
    }).catch((res)=>{
      // console.log("err3",res.response)
      cookie = util.inspect(res.response.headers["set-cookie"][0]).replace(/'/g,"");
      console.log(cookie)
      loc = util.inspect(res.response.headers.location).replace(/'/g,"");
      console.log(loc)
    })


    if(loc != "")
    await axios.request({
      url:loc,
      method:'get',
      // maxRedirects:0,
      headers:{"Cookie":cookie
      ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
      ,"Connection": "keep-alive"
      ,"Host": "jxfw.gdut.edu.cn"
      ,"accept":"*/*"}
    }).then((res)=>{
      // console.log(res);
    }).catch((res)=>{
      // console.log("err4",res.response)
    })

    await axios.request({
      url:"https://jxfw.gdut.edu.cn/xsgrkbcx!getDataList.action",
      method:'post',
      // maxRedirects:0,
      data:"xnxqdm=202001&zc=&page=1&rows=500&sort=kxh&order=asc",
      headers:{"Cookie":cookie
      ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
      ,"Connection": "keep-alive"
      ,"Host": "jxfw.gdut.edu.cn"
      ,"Content-Type": "application/x-www-form-urlencoded"
      ,"accept":"*/*"}
    }).then((res)=>{
      // console.log(res);
      updateData(res.data.rows,stuAccount);
      if(res.data.rows)
        e = true;
      else e = false;
      
      
      // e = JSON.parse(e);
    }).catch((res)=>{
      console.log("err4",res)
    })
    
  }
  

  

  return {
    e
  }
};
