﻿/*
更新时间: 2021-02-28 09:03
Github Actions使用方法见[@lxk0301](https://raw.githubusercontent.com/lxk0301/scripts/master/githubAction.md) 使用方法大同小异
点击几篇文章和视频，自动获取阅读请求，在Github Actions中的Secrets新建name为'YOUTH_READ'的一个值，拷贝抓包的请求体到下面Value的文本框中，添加的请求体越多，获得青豆次数越多，本脚本不包含任何推送通知
多个请求体时用'&'号或者换行隔开" ‼️
*/

const $ = new Env("中青看点阅读")
//const notify = $.isNode() ? require('./sendNotify') : '';
let ReadArr = [], timebodyVal ="";
let YouthBody = $.getdata('youth_autoread')||$.getdata("zqgetbody_body");
let smallzq = $.getdata('youth_cut');
let indexLast = $.getdata('zqbody_index');
let artsnum = 0, videosnum = 0;
let videoscore = 0,readscore = 0;
let artArr = [], delbody = 0;
if (isGetbody = typeof $request !==`undefined`) {
   Getbody();
   $done()
} 
let lastIndex = $.getdata('zqbody_index')
if (!$.isNode() && !YouthBody == true) {
    $.log("您未获取阅读请求，请求阅读后获取")
    $.msg($.name, "您未获取阅读请求，请求阅读后获取", "", {
        'open-url': "https://kandian.youth.cn/u/UnEWm"
    })
    return
} else if (!$.isNode() && YouthBody.indexOf("&") == -1) {
    ReadArr.push(YouthBody)
} else {
    if ($.isNode()) {
        if (process.env.YOUTH_READ && process.env.YOUTH_READ.indexOf('&') > -1) {
            YouthBodys = process.env.YOUTH_READ.split('&');
            console.log(`您选择的是用"&"隔开\n`)
        } else if (process.env.YOUTH_READ && process.env.YOUTH_READ.indexOf('\n') > -1) {
            YouthBodys = process.env.YOUTH_READ.split('\n');
            console.log(`您选择的是用换行隔开\n`)
        } else {
            YouthBodys = [process.env.YOUTH_READ]
        }
    } else if (!$.isNode() && YouthBody.indexOf("&") > -1) {
        YouthBodys = YouthBody.split("&")
    };
    Object.keys(YouthBodys).forEach((item) => {
        if (YouthBodys[item]) {
            ReadArr.push(YouthBodys[item])
        }
    })
}
timeZone = new Date().getTimezoneOffset() / 60;
timestamp = Date.now() + (8 + timeZone) * 60 * 60 * 1000;
bjTime = new Date(timestamp).toLocaleString('zh', {
    hour12: false,
    timeZoneName: 'long'
});
console.log(`\n === 脚本执行 ${bjTime} ===\n`);
$.log("******** 您共获取" + ReadArr.length + "次阅读请求，任务开始 *******")

!(async() => {
    if (!ReadArr[0]) {
        console.log($.name, '【提示】请把抓包的请求体填入Github 的 Secrets 中，请以&隔开')
        return;
    }
if (!$.isNode()) {
  $.begin = indexLast ? parseInt(indexLast) : 1;
  if ($.begin + 1 < ReadArr.length) {
    $.log("\n上次运行到第" + $.begin + "次终止，本次从" + (parseInt($.begin) + 1) + "次开始");
  } else {
    $.log("由于上次缩减剩余请求数已小于总请求数，本次从头开始");
    indexLast = 0,
    $.begin = 0
  }
} else {
  indexLast = 0,
  $.begin = 0
}
    if (smallzq == "true") {
        $.log("     请注意缩减请求开关已打开‼️\n     如不需要    请强制停止\n     关闭Boxjs缩减请求开关")
    };
    $.index = 0;
    for (var i = indexLast ? indexLast : 0; i < ReadArr.length; i++) {
        if (ReadArr[i]) {
            articlebody = ReadArr[i];
            $.index = $.index + 1;
            $.log(`-------------------------\n开始中青看点第${$.index}次阅读\n`);
            await bodyInfo();
        }
    };
    $.log("\n……………………………………………………………………\n\n本次共删除" + delbody + "个请求，剩余" + (ReadArr.length - delbody) + "个请求");
    $.log("本次共阅读" + artsnum + "次资讯，共获得" + readscore + "青豆\n观看" + videosnum + "次视频，获得" + videoscore + "青豆(不含0青豆次数)\n");
    console.log(`-------------------------\n\n中青看点共完成${$.index}次阅读，共计获得${readscore+videoscore}个青豆，阅读请求全部结束`);
    $.msg($.name, `本次运行共完成${$.index}次阅读，共计获得${readscore+videoscore}个青豆`,"删除"+delbody+"个请求"+(readtimes?"，阅读时长"+parseInt(readtimes)+"分钟":""))
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

function bodyInfo() {
    return new Promise((resolve, reject) => {
        $.get(batHost('article/info/get.json?' + articlebody), async(error, resp, data) => {
            let bodyobj = JSON.parse(data);
            //$.log(JSON.stringify(bodyobj,null,2))
                $.begin = $.begin + 1;
                let res = $.begin % ReadArr.length;
                $.setdata(res + "", 'zqbody_index');
            try {
                if (bodyobj.error_code == "200007"&&!$.isNode()) {
                await removebody();
                delbody += 1;
                $.log(bodyobj.message+"已自动删除");
                } else if (bodyobj.error_code == 0) {
                    acticid = bodyobj.url.match(/\d+/)[0];
                    artdesc = bodyobj.description
                    author = bodyobj.account.name
                    ctype = bodyobj.ctype == 0 ? "阅读资讯" : "观看视频";
                    if (artArr.indexOf(acticid) == -1) {
                artArr.unshift(acticid);
                        $.log(ctype + ": " + artdesc + "  ----- " + author + "\n")
                        await $.wait(10000);
                        await AutoRead();
                    } else if (artArr.indexOf(acticid) > -1&&!$.isNode()) {
                        await removebody();
                        $.log("文章ID:" + acticid + " 请求重复，已自动删除")
                        delbody += 1;
                        await $.wait(1000)
                    }
                }
            } catch (e) {
                $.log('获取文章请求失败' + e)
            } finally {
                resolve()
            }
        })
    })
}


function AutoRead() {
    return new Promise((resolve, reject) => {
        $.post(batHost('article/complete.json', articlebody), async(error, response, data) => {
            let readres = JSON.parse(data);
            //$.log(JSON.stringify(readres,null,2))
            if (readres.items.complete == 1) {
                $.log(readres.items.max_notice)
            } else {
                if (readres.error_code == '0' && data.indexOf("read_score") > -1 && readres.items.read_score > 0) {
                    console.log(`本次阅读获得${readres.items.read_score}个青豆，请等待30s后执行下一次阅读\n`);
                    if (data.indexOf("ctype") > -1) {
                        if (readres.items.ctype == 0) {
                            artsnum += 1
                            readscore += parseInt(readres.items.read_score);
                        } else if (readres.items.ctype == 3) {
                            videosnum += 1
                            videoscore += parseInt(readres.items.read_score);
                        }
                    }
                    if ($.index % 2 == 0) {
                        if ($.isNode() && process.env.YOUTH_ATIME) {
                            timebodyVal = process.env.YOUTH_ATIME;
                        } else {
                            timebodyVal = $.getdata('autotime_zq');
                        }
                        await readTime()
                    };
                    if ($.index == ReadArr.length) {
                        $.log($.index + "次任务已全部完成，即将结束")
                    } else {
                        await $.wait(20000);
                    }
                } else if (readres.error_code == '0' && data.indexOf('"score":0') > -1 && readres.items.score == 0) {
                    $.log(`\n本次阅读获得0个青豆，等待10s即将开始下次阅读\n`);
                    if (smallzq == "true") {
                        await removebody();
                        $.log("已删除第" + ($.begin) + "个请求，如无需删除请及时提前关掉boxjs内的开关，使用后即关闭")
                        delbody += 1
                    }
                } else if (readres.success == false) {
                    console.log(`第${$.index}次阅读请求有误，请删除此请求`);
                    if (smallzq == "true") {
                        await removebody();
                        $.log("已删除第" + ($.begin) + "个请求，如无需删除请及时提前关掉boxjs内的开关，使用后即关闭");
                        delbody += 1
                    }
                }
            }
            resolve()
        })
    })
}

function removebody() {
  if (articlebody !== ReadArr[0]) {
      smallbody = $.getdata('youth_autoread').replace("&" + articlebody, "");
  } else {
      smallbody = $.getdata('youth_autoread').replace(articlebody + "&", "")
  }
  $.setdata(smallbody, 'youth_autoread')
}

function batHost(api, body) {
    return {
        url: 'https://ios.baertt.com/v5/' + api,
        headers: {
            'User-Agent': 'KDApp/2.0.2 (iPhone; iOS 14.5; Scale/3.00)',
            'Host': 'ios.baertt.com',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    }
}

function readTime() {
    return new Promise((resolve, reject) => {
        $.post(batHost('user/stay.json', timebodyVal), (error, resp, data) => {
            let timeres = JSON.parse(data)
            if (timeres.error_code == 0) {
                readtimes = timeres.time / 60
                $.log(`阅读时长共计` + Math.floor(readtimes) + `分钟`)
            }
            resolve()
        })
    })
}

function Getbody() {
    if ($request && $request.method != `OPTIONS` && $request.url.match(/\/article\/info\/get/)) {
        bodyVal = $request.url.split("?")[1];
        if (YouthBody) {
            if (YouthBody.indexOf(bodyVal) > -1) {
                $.log("此阅读请求已存在，本次跳过")
            } else if (YouthBody.indexOf(bodyVal) == -1) {
                YouthBodys = YouthBody + "&" + bodyVal;
                $.setdata(YouthBodys, 'youth_autoread');
                $.log(`${$.name}获取阅读: 成功, YouthBodys: ${bodyVal}`);
                bodys = YouthBodys.split("&")
                $.msg($.name, "获取第" + bodys.length + "个阅读请求: 成功🎉", ``)
            }
        } else {
            $.setdata(bodyVal, 'youth_autoread');
            $.log(`${$.name}获取阅读: 成功, YouthBodys: ${bodyVal}`);
            $.msg($.name, `获取第一个阅读请求: 成功🎉`, ``)
        }
    } else if ($request && $request.method != `OPTIONS` && $request.url.match(/\/v5\/user\/stay/)) {
        const timebodyVal = $request.body;
        if (timebodyVal) $.setdata(timebodyVal, 'autotime_zq');
        $.log(`${$.name}获取阅读时长: 成功, timebodyVal: ${timebodyVal}`);
        $.msg($.name, `获取阅读时长: 成功🎉`, ``)
    }
}


function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
