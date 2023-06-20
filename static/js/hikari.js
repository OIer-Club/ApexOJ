console.log('             ff                      \n\
   f:.      fff                                   \n\
   ff       fff                                   \n\
   ff       fff     fff     f i                   \n\
  fff       ff      ff     fff                    \n\
  ffff      fff     ff    ffff,                   \n\
  :fff     fffj     fff  ffff                     \n\
  fff:     .ff      fff  fff                      \n\
  fff     ffff      fffffff               DD      \n\
  ffffffffffff  D   fffff,                DD      \n\
  ffffffffffff DDD ffffff                         \n\
  fffff   :ff; DDD ffffffff    ffff               \n\
  ff       fff     fff  ffffffffi f.      f       \n\
 fff       fff ff  fff    ffffff  f  f tfff     f \n\
 fff       ffftff  fff     ffff  ff  f ffff    ff \n\
 fff      fffffff  fff       ff  ff ffff ff   ff  \n\
 fff      fffftf             f  ffff;ff  ff  ff   \n\
 fff      ffff ft f          ,ffffffff    ffff    \n\
  ff      fff  ffff          ffff fff:     :      \n\
               fff                  f             \n\
    Hikari-Frontend Powered by Hikari Developers    ');

var isphone = (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i));

/* 加载导航菜单*/
var menu = data["menu"];
var menuhtml = "";

if (data["title"]) {
  document.title = data["title"] + " | Hikari";
}

menuhtml += `
  <div class="ui container">
    <a class="item" href="/"><img src="/assets/image/logo.png" style="height:35px;width:100px;"></a>`;
if (isphone) {
  menuhtml += `
        <div class="ui item simple dropdown">
          <span>功能<i class="dropdown icon"></span></i>
          <div class="menu">`;
}
for (var i = 0; i < menu["list"].length; i++) {
  menuhtml += `
          <a class="item" href="`+ menu["list"][i]["url"] + `">` + menu["list"][i]["name"] + `</a>`;
}
if (isphone) {
  menuhtml += `
          </div>
        </div>`;
}
menuhtml += `
    <div class="right menu">`;
if (menu["login"] == true) {
  menuhtml += `
        <div class="ui item simple dropdown">
          <img class="ui avatar image" src="` + menu["avatar"] + `"><span>`+ menu["uname"] + `
          <i class="dropdown icon"></span></i>
          <div class="menu">`;
  for (var i = 0; i < menu["userlist"].length; i++) {
    menuhtml += `
            <a class="item" href="`+ menu["userlist"][i]["url"] + `">` + menu["userlist"][i]["name"] + `</a>`;
  }
  if (menu["admin"] == true && isphone) {
    menuhtml += `<a class="ui item simple dropdown" href="/admin/"><i class="cogs icon"></i> 管理后台</a>`;
  }
  menuhtml += `
            <a class="item" href="javascript:void(0);" onclick="logout()"><i class=\"power icon\"></i>注销</a>
          </div>
        </div>`;
  if (menu["admin"] == true && !isphone) {
    menuhtml += `<a class="ui item simple dropdown" href="/admin/"><i class="cogs icon"></i> 管理后台</a>`;
  }
} else {
  menuhtml += `
        <div class="ui item simple dropdown">
          <i class="user icon"></i> 用户
          <i class="dropdown icon"></i>
          <div class="menu">
            <a class="item" href="/user/login">登入</a>
            <a class="item" href="/user/register">注册</a>
          </div>
        </div>`;
}

menuhtml += `
    </div>
  </div>
`;

document.getElementById('menu').innerHTML = menuhtml;

/* 加载Body */  
var body = data["body"];
var bodyhtml = "";

/* 框架加载 */
bodyhtml += `
  <div class="ui tab active wide container">
    <div style="margin-top: 28px;">
      <div class="ui main wide container">
          <div class="ui stackable two column grid">
            <div class="two column row">`;
/* 左侧主体加载 */
if (body["left"] != undefined) {
  bodyhtml += `<div class="twelve wide column">`;
  for (var i = 0; i < body["left"].length; i++) { // 遍历
    if (body["left"][i]["type"] == "card") {
      bodyhtml += `<div class="ui container segment">` + body["left"][i]["txt"] + `</div>`;
    } else if (body["left"][i]["type"] == "html") {
      bodyhtml += body["left"][i]["txt"];
    } else if (body["left"][i]["type"] == "oiermeet") {
      bodyhtml += oiermeet(body["left"][i]["list"]);
    } else if (body["left"][i]["type"] == "page") {
      bodyhtml += page(body["left"][i]["num"],body["left"][i]["now"],body["left"][i]["get"]);
    } else if (body["left"][i]["type"] == "card2") {
      bodyhtml += `
      <h4 class="ui top attached block header">`+ body["left"][i]["title"] + `</h4>
      <div class="ui bottom attached segment">`+ body["left"][i]["content"] + `</div>`;
    }
  }
  bodyhtml += `</div>`;
}
/* 右侧主体加载 */
if (body["right"] != undefined) {
  bodyhtml += `<div class="four wide column">`;
  for (var i = 0; i < body["right"].length; i++) {
    if(body["right"][i]["title"]=="html") {
      bodyhtml += body["right"][i]["content"];
    } else {
    bodyhtml += `
      <h4 class="ui top attached block header">`+ body["right"][i]["title"] + `</h4>
      <div class="ui bottom attached segment">`+ body["right"][i]["content"] + `</div>`;
    }
  }
  bodyhtml += `</div>`;
}
/* 结尾加载 */
bodyhtml += `
            </div>
          </div>
      </div>
    </div>
  </div>`;

if (body["footer"] != undefined) {
    bodyhtml += body["footer"];
}
/* 加载单独页面所需js */
if (data["js"]) {
  for (var i = 0; i < data["js"].length; i++) {
    loadjs(data["js"][i]);
  }
}

/* 函数区 */
function oiermeet(list) {
  var html = "";
  html += `
<div class="eleven wide column">
  <div class="ui bottom attached segment">
    <div class="ui styled fluid accordion">`;
  for (var j = 0; j < list.length; j++) {
    html += `
      <div class="title"><i class="dropdown icon"></i>`+ list[j]["city"] + `</div>
      <div class="content">
        <table class="ui celled padded table">
          <thead>
            <tr>
              <th class="single line">用户ID</th>
              <th>用户名</th>
              <th>私信Ta</th>
            </tr>
          </thead>
          <tbody>`;
    for (var k = 0; k < list[j]["user"].length; k++) {
      html += `
            <tr>
              <td>`+ list[j]["user"][k]["id"] + `</td>
              <td><img class="ui avatar image" src="`+ list[j]["user"][k]["avatar"] +`"><a href = "/user/?uid=`+list[j]["user"][k]["id"]+`">`+ list[j]["user"][k]["name"] + ` ` + ((list[j]["user"][k]["tag"]) ? `<span class="ui mini purple label">` + list[j]["user"][k]["tag"] + `</span>` : ``) + `</td>`;
      html += `
              <td><a class="ui basic button" href="/user/chat.php?user=`+ list[j]["user"][k]["id"] + `"><i class="icon comments"></i>私信</a></td>`;
      html += `
            </tr>`;
    }
    html += `
          </tbody>
        </table>
      </div>`;
  }
  html += `
    </div>
  </div>
</div>`;
  return html;
}

function loadjs(src) {
  var oHead = document.getElementsByTagName('HEAD').item(0);
  var oScript = document.createElement("script");
  oScript.type = "text/javascript";
  oScript.src = src;
  oHead.appendChild(oScript);
}

function page(numx,nowx,geturl) {
  var html = "";
  var num = Number(numx);
  var now = Number(nowx);
  html += `<center><div class="ui pagination menu">`;
  if(now!=1) {
    html += `<a class="item" href="?page=1"><i class="icon angle double left"></i></a>`;
    html += `<a class="item" href="?page=`+(now-1)+geturl+`"><i class="icon angle left"></i></a>`;
  }
  for(var i=now-5;i<=now+5;i++) {
    if(i>=1&&i<=num) {
      if(i==now) {
        html += `<a class="active item" href="?page=`+i+geturl+`">`+i+`</a>`;
      } else {
        html += `<a class="item" href="?page=`+i+geturl+`">`+i+`</a>`;
      }
    }
  }
  if(now!=num) {
    html += `<a class="item" href="?page=`+(now+1)+geturl+`"><i class="icon angle right"></i></a>`;
    html += `<a class="item" href="?page=`+num+geturl+`"><i class="icon angle double right"></i></a>`;
  }
  html += `</div></center>`;
  return html;
}

/* 渲染页面 */

document.getElementById('container').innerHTML = bodyhtml;