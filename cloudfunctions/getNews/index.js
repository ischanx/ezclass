
const axios = require('axios');
const util = require("util");
const cheerio = require("cheerio");
const cloud = require('wx-server-sdk');
cloud.init();
const DB = cloud.database({
  env: 'chanx-server'
});
const cookies = DB.collection('cookies');
const newsData = DB.collection('newsData');
// 云函数入口函数
exports.main = async (event, context) => {
  let e = {};
  let obj ={};
  let cookie = "";
  let formdata = "";
  //从数据库取cookie
  await cookies.get("news").then((res)=>{
    cookie = res.data[0].cookie;
  })

  if(cookie != "")
  await axios.request({
    url:"http://news.gdut.edu.cn/ArticleList.aspx?category=4",
    method:'get',
    maxRedirects:0,
    headers:{"Cookie":cookie
    ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
    ,"Connection": "keep-alive"
    ,"Origin": "http://news.gdut.edu.cn"
    ,"Host": "news.gdut.edu.cn"
    ,"accept":"*/*"}
  }).then((res)=>{
    const $ = cheerio.load(util.inspect(res.data));
    const news = [];
    $("#ContentPlaceHolder1_ListView1_ItemPlaceHolderContainer p").each((index,item)=>{
      let obj = {};
      obj["_id"] = item.children[1].attribs.href.split("=")[1];
      obj.title = item.children[1].attribs.title;
      obj.href = item.children[1].attribs.href.replace("./","http://news.gdut.edu.cn/");
      obj.from = item.children[3].attribs.title;
      obj.time = item.children[4].children[0].data.replace("]","");
      obj.category = 4;
      news.push(obj);
    });
    let lastestId;
    //取数据库信息，比对是否有更新
    newsData.orderBy("_id","desc").get().then((res)=>{
      console.log("res",res)
      lastestId = res.data[0]&&res.data[0]["_id"]?res.data[0]["_id"]:0;
      news.forEach((item,index)=>{
        //新通知
        if(item["_id"] > lastestId)
          axios.request({
            url: item.href,
            method:'get',
            maxRedirects:0,
            headers:{"Cookie":cookie
            ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
            ,"Connection": "keep-alive"
            ,"Origin": "http://news.gdut.edu.cn"
            ,"Host": "news.gdut.edu.cn"
            ,"accept":"*/*"}
          }).then((res)=>{
            //文章内容
            let contentHTML = eval(util.inspect(res.data));
            const start = contentHTML.indexOf("<br />",contentHTML.indexOf("<br />",contentHTML.indexOf('class="articleBody"'))+6) +6;
            const end = contentHTML.lastIndexOf("</div>",contentHTML.indexOf('class="articleinfos"')) -1 ;
            contentHTML ='<div class="articleBody">'+ contentHTML.substring(start,end).trim() + "</div>";
            const getAttachment = function(content,isImage){
              let items = content.match(new RegExp("<"+(isImage?"img":"a")+ "[^>]+>","g"));
              items = items ? items : [];
              let arr = [];
              for (var j = 0; j < items.length; j++) {
                // 正则匹配，摘出img标签下的src里的内容，即capture
                items[j].replace(new RegExp("<"+(isImage?"img":"a")+ " [^>]*"+(isImage?"src":"href")+ "=[\'\"]([^\'\"]+)[^>]*>","gi")
                , function(match,capture) {
                  // content.replace(match,"");
                  arr.push(capture);
                });
              }
              return arr;
            }
            item.images = getAttachment(contentHTML,true);
            item.files = getAttachment(contentHTML,false);
            item.content = contentHTML;


            const oneNews = cheerio.load(util.inspect(res.data));
            //取具体时间
            let info = oneNews(".articleinfos").text();
            const index = info.indexOf("[发布日期:")
            item.time = info.substring(index+6,info.indexOf("]",index+ 6));
            //取摘要
            let content = eval("'" + oneNews("#articleBody").text() + "'").trim();
            content = content.substring(content.indexOf("\n",content.indexOf("单 位："))).trim();
            item.abstract = content.replace(/\s/g, "").substring(0,55) + "…";
            //更新数据库
            newsData.add({
              data: item
            }).then(res => {
              // console.log(res)
            }).catch(err => {
              console.error(util.inspect(err))
            })
          }).catch(err=>{
            console.log(util.inspect(err))
          });
      })
    });
    e = news;
    console.log(news)

  }).catch((err)=>{
    console.log(util.inspect(err))
    if(util.inspect(err.message.includes("302"))){
      cookies.doc("news").update({
        data: {
          cookie:""
        },
      });
      // cookie = "";
    }
  })

  //cookie无效
  if(cookie == ""){
    await axios.request({
      url:"http://news.gdut.edu.cn/UserLogin.aspx",
      method:'get',
      headers:{"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"}
    }).then((res)=>{
      let data = eval (util.inspect(res.data));
      cookie = eval(util.inspect(res.headers["set-cookie"][0]));
      console.log(cookie)
      const $ = cheerio.load(data);
      $("#form1 input").each((index,item)=>{
        let val = null;
        if(index > 5)
          return;
        if(item.attribs.name.includes("userEmail")){
          val = "gdutnews";
        }else if(item.attribs.name.includes("userPassWord")){
          val = "newsgdut";
        }else if(item.attribs.name.includes("CheckBox1")){
          val = "on"
        }
        obj[item.attribs.name] = val? val : item.attribs.value;
      })
      for(let i in obj){
        formdata += encodeURIComponent(i) + "="+encodeURIComponent(obj[i]) + "&";
      }
      formdata = formdata.replace(encodeURIComponent("登录&"),encodeURIComponent("登录"));
      console.log(obj)
    })
  
    await axios.request({
      url:"http://news.gdut.edu.cn/UserLogin.aspx",
      method:'post',
      data: formdata,
      maxRedirects: 0,
      headers:{"Cookie":cookie + " Domain=news.gdut.edu.cn;","Content-Type": "application/x-www-form-urlencoded"
      ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
      ,"Connection": "keep-alive"
      ,"Origin": "http://news.gdut.edu.cn"
      ,"Host": "news.gdut.edu.cn"
      ,"accept":"*/*"}
    }).then((res)=>{
      // console.log(res);
    }).catch((err)=>{
      console.log(util.inspect(err.message))
      if(util.inspect(err.message.includes("302"))){
        //更新cookie到数据库
        cookies.doc("news").update({
          data: {
            cookie:cookie
          },
        });
      }
    })

    await axios.request({
      url:"http://news.gdut.edu.cn/ArticleList.aspx?category=4",
      method:'get',
      headers:{"Cookie":cookie
      ,"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36"
      ,"Connection": "keep-alive"
      ,"Origin": "http://news.gdut.edu.cn"
      ,"Host": "news.gdut.edu.cn"
      ,"accept":"*/*"}
    }).then((res)=>{
      // console.log(res);
    }).catch((res)=>{
      // console.log(res)
    })
  }
  

  

  return {
    e
  }
};
