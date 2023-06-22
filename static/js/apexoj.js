function user_login() {
  $.post('/api/user/login', {
      "username":document.getElementById("login_username").value,
      "password":document.getElementById("login_password").value
    }, function(data){
      if(data.code == 'OK') {
        swalx("登入成功",2,()=>{location.reload()});
      } else if(data.code == 'NO') {
        swalx("账号/密码错误",2,()=>{document.getElementById("login_password").value = ""});
      } else {
        swalx("未知错误,请重试",2);
      }
  });
}

function user_login_enter() {
  document.getElementById("userlogin").style.display = "";
}

function user_login_exit() {
  document.getElementById("userlogin").style.display = "none";
}

function user_register() {
  if(document.getElementById("register_password").value != document.getElementById("register_repassword").value) {
    swalx("两次密码不正确",2,()=>{
      document.getElementById("register_password").value = "";
      document.getElementById("register_repassword").value = "";
    });
  } else {
    $.post('/api/user/register', {
        "username":document.getElementById("login_username").value,
        "password":document.getElementById("login_password").value,
        "email":document.getElementById("login_email").value
      }, function(data){
        if(data.code == 'OK') {
          window.location.href="/user/register?token="+data.token;
        } else if(data.code == "NO") {
          swalx(data.message,2);
        } else {
          swalx("未知错误,请重试",2);
        }
    });
  }
}

function user_logout() {
  $.post('/api/user/login', {}, ()=>{location.reload()});
}

function swalx(data,time,fun = ()=>{}) {
  swal({
    title: data,
    text: String(time)+'秒后自动关闭。',
    timer: 1000*time
  }).then(fun);
}
