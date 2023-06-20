const http = require('http');
const session  = require('express-session');
let Express = require('express');
global.app = Express();

const fs = require('fs');
const path = require('path');

// 读取 config
var config = JSON.parse(fs.readFileSync(path.join(__dirname + "/config", 'config.json'), {encoding: 'utf8',flag: 'r'}).toString());

// Set template engine ejs
app.set("view engine","ejs");
app.set("views", __dirname + "/views");
// Set assets dir
app.use(Express.static(__dirname + "/static", { maxAge: '1y' }));
// Set Session
app.use(session ({
  secret: config.serve.session_token,
  resave:false,
  saveUninitialized: true,
  cookie: {secure:false, maxAge: 3*24*60*60} /* 第一个参数：只有在https才可以访问cookie；第二个参数：设置cookie的过期时间 */
}))

app.server = http.createServer(app);

// 解析 POST 提交过来的表单数据
app.use(Express.urlencoded({ extended: false }));

// api HTML 模块
app.get('/', function(req, res){
  res.render('index',{
    config: config.main,
    session: req.session,
    title: '首页'
  });
});

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

app.server.listen(config.serve.post, function(){
  console.log('[index.js]: listening on *:' + config.serve.post);
});