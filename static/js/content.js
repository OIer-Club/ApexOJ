var body = data["body"];
var bodyhtml = "";

/* 框架加载 */
bodyhtml += `
  <div class="ui tab active wide container">
    <div style="margin-top: 28px;">
      <div class="ui main wide container">
        <div style="padding-left: 1em; padding-right: 1em;">
          <div class="ui two column grid">
            <div class="two column row">`;
/* 左侧主体加载 */
if (body["left"] != undefined) {
  bodyhtml += `<div class="twelve wide column">`;
  for (var i = 0; i < body["left"].length; i++) { // 遍历
    if (body["left"][i]["type"] == "benben") {
      bodyhtml += benben(body["left"][i]["list"]);
    } else if (body["left"][i]["type"] == "card") {
      bodyhtml += `<div class="ui container segment">` + body["left"][i]["txt"] + `</div>`;
    } else if (body["left"][i]["type"] == "oiermeet") {
      bodyhtml += oiermeet(body["left"][i]["list"]);
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
    bodyhtml += `
    <h4 class="ui top attached block header">`+ body["right"][i]["title"] + `</h4>
    <div class="ui bottom attached segment">`+ body["right"][i]["content"] + `</div>`;
  }
  bodyhtml += `</div>`;
}
/* 结尾加载 */
bodyhtml += `
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

/* 加载单独页面所需js */
if (data["js"]) {
  for (var i = 0; i < data["js"].length; i++) {
    loadjs(data["js"][i]);
  }
}

/* 函数区 */

function benben(list) { // 将犇犇数据解析为html
  var html = "";
  for (var j = 0; j < list.length; j++) {
    html += `
        <div class="ui ze comments">
          <div class="ui container segment">
            <div class="limited comment">
              <a class="avatar">
                <img class="ui avatar image" src="https://cdn.luogu.com.cn/upload/usericon/`+ list[j]["luoguUID"] + `.png" referrerPolicy="no-referrer">
              </a>
              <div class="content">
                <span class="author">
                  <a href="/user/?uid=`+ list[j]["uid"] + `">
                    <span style="font-weight: normal;">`+ list[j]["uname"] + `</span> 
                    `+ ((list[j]["tag"]) ? `<span class="ui mini purple label">` + list[j]["tag"] + `</span>` : ``) + `
                  </a>
                </span>
                <div class="metadata">
                  <div class="date">`+ list[j]["time"] + `</div>
                </div>
                <div class="container">
                  <div class="text">`+ list[j]["txt"] + `</div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
  }
  return html;
}

function oiermeet(list) {
  var html = "";
  html += `
<div class="eleven wide column">
  <div class="ui bottom attached segment">
    <div class="ui styled fluid accordion">`;
  for (var j = 0; j < list.length-1; j++) {
    html += `
      <div class="title"><i class="dropdown icon"></i>`+ list[j]["city"] + `</div>
      <div class="content">
        <h2>CSp2021-J1</h2>
        <table class="ui celled padded table">
          <thead>
            <tr>
              <th class="single line">准考证号</th>
              <th>本站账号</th>
              <th>私信Ta</th>
            </tr>
          </thead>
          <tbody>`;
    for (var k = 0; k < list[j]["csp-j"].length; k++) {
      html += `
            <tr>
              <td>`+ list[j]["csp-j"][k]["id"] + `</td>
              <td>`+ list[j]["csp-j"][k]["name"] + ` ` + ((list[j]["csp-j"][k]["tag"]) ? `<span class="ui mini purple label">` + list[j]["csp-j"][k]["tag"] + `</span>` : ``) + `</td>`;
      if(list[j]["csp-j"][k]["luoguUID"]!=1) html += `
              <td><a class="ui basic button" href="https://www.luogu.com.cn/chat?uid=`+ list[j]["csp-j"][k]["luoguUID"] + `"><i class="icon user"></i>洛谷私信 `+ list[j]["csp-j"][k]["luoguUID"] + `</a></td>`;
      else html += `
              <td><a class="ui basic button" href="#"><i class="icon user"></i>Ta未绑定洛谷账号</a></td>`;
      html += `
            </tr>`;
    }
    html += `
          </tbody>
        </table>
        <h2>CSp2021-S1</h2>
        <table class="ui celled padded table">
          <thead>
            <tr>
              <th class="single line">准考证号</th>
              <th>本站账号</th>
              <th>私信Ta</th>
            </tr>
          </thead>
          <tbody>`;
    for (var k = 0; k < list[j]["csp-s"].length; k++) {
      html += `
            <tr>
              <td>`+ list[j]["csp-s"][k]["id"] + `</td>
              <td>`+ list[j]["csp-s"][k]["name"] + ` ` + ((list[j]["csp-s"][k]["tag"]) ? `<span class="ui mini purple label">` + list[j]["csp-s"][k]["tag"] + `</span>` : ``) + `</td>`;
      if(list[j]["csp-s"][k]["luoguUID"]!=1) html += `
              <td><a class="ui basic button" href="https://www.luogu.com.cn/chat?uid=`+ list[j]["csp-s"][k]["luoguUID"] + `"><i class="icon user"></i>洛谷私信 `+ list[j]["csp-s"][k]["luoguUID"] + `</a></td>`;
      else html += `
              <td><a class="ui basic button" href="#"><i class="icon user"></i>Ta未绑定洛谷账号</a></td>`;
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

/* 渲染页面 */

document.getElementById('container').innerHTML = bodyhtml;