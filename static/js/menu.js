var menu = data["menu"];
var menuhtml = "";

if (data["title"]) {
  document.title = data["title"] + " | Hikari";
}

menuhtml += `
  <div class="ui container">
    <a class="item" href="/"><img src="/logo.png" style="height:35px;width:100px;"></a>`;
for (var i = 0; i < menu["list"].length; i++) {
  menuhtml += `
    <a class="item" href="`+ menu["list"][i]["url"] + `">` + menu["list"][i]["name"] + `</a>`;
}
menuhtml += `
    <div class="right menu">`;

if (menu["login"] == true) {
  menuhtml += `
        <div class="ui item simple dropdown">
          <i class="user icon"></i> `+ menu["uname"] + `
          <i class="dropdown icon"></i>
          <div class="menu">`;
  for (var i = 0; i < menu["userlist"].length; i++) {
    menuhtml += `
            <a class="item" href="`+ menu["userlist"][i]["url"] + `">` + menu["userlist"][i]["name"] + `</a>`;
  }
  menuhtml += `
          </div>
        </div>`;
  if (menu["admin"] == true) {
    menuhtml += `
    <div class="ui item simple dropdown">
      <i class="cogs icon"></i> 管理后台
      <i class="dropdown icon"></i>
      <div class="menu">`;
    for (var i = 0; i < menu["adminlist"].length; i++) {
      menuhtml += `
        <a class="item" href="`+ menu["adminlist"][i]["url"] + `">` + menu["adminlist"][i]["name"] + `</a>`;
    }
    menuhtml += `
      </div>
    </div>`;
  }
} else {
  menuhtml += `
        <div class="ui item simple dropdown">
          <i class="user icon"></i> 用户
          <i class="dropdown icon"></i>
          <div class="menu">
          <a class="item" href="/auth/login.php">登入</a>
          <a class="item" href="/auth/register.php">注册</a>
          </div>
        </div>`;
}

menuhtml += `
    </div>
  </div>
`;

document.getElementById('menu').innerHTML = menuhtml;