const http = require('http');
const session  = require('express-session');
let Express = require('express');
global.app = Express();

// Set template engine ejs
app.set("view engine","ejs");
// Set assets dir
app.use(Express.static(__dirname + '/static', { maxAge: '1y' }));
// Set Session
app.use(session ({
  secret:'dn65f61f68yn1fd6w64e8h',
  resave:false,
  saveUninitialized: true,
  cookie: {secure:false, maxAge: 3*24*60*60} /* 第一个参数：只有在https才可以访问cookie；第二个参数：设置cookie的过期时间 */
}))

app.server = http.createServer(app);

// 全局变量
var confing = {
  title: 'ApexOJ',
  root: '', // 域名
  menu: {
    list: [{name: '首页', url: '/'}],
    userlist: [{name: '个人主页', url: '/user'}]
  }
};

// 解析 POST 提交过来的表单数据
app.use(Express.urlencoded({ extended: false }));

// api HTML 模块
app.get('/', function(req, res){
  res.render('index',{
    confing: confing,
    session: req.session,
    title: '首页'
  });
});
__dirname
var cors = require('cors');
app.use(cors());

// socket.io 模块
const io = require('socket.io')(http, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cors: {
    origin: "https://www.apexoj.net",
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('enter', (data) => { // 进入新页面
    socket.emit("online",{});
  });
  socket.on('disconnect', function(){
    io.emit("online",{});
  });
});

app.server.listen(5246, function(){
  console.log('[index.js]: listening on *:5246');
});