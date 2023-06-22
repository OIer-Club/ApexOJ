const http = require('http');
const session  = require('express-session');
let Express = require('express');
global.app = Express();

const fs = require('fs');
const path = require('path');

const validator = require('validator');
const setpassword = require('./model/setpassword');

const bodyParser = require('body-parser');
// 配置body-parser
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())

// 读取 config
var config = JSON.parse(fs.readFileSync(path.join(__dirname + "/config", 'config.json'), {encoding: 'utf8',flag: 'r'}).toString());

// Set template engine ejs
app.set("view engine","ejs");
app.set("views", __dirname + "/views");
// Set assets dir
app.use(Express.static(__dirname + "/static", { maxAge: '1y' }));
// Set Session
app.use(session ({
  secret: config.server.session_token,
  resave:false,
  saveUninitialized: true,
  cookie: {secure:false, maxAge: 3*24*60*60} /* 第一个参数：只有在https才可以访问cookie；第二个参数：设置cookie的过期时间 */
}))

app.server = http.createServer(app);

// MySQL
var mysql  = require('mysql'); 
var connection = mysql.createConnection({     
    host     : config.server.mysql.host,
    user     : config.server.mysql.user,
    password : config.server.mysql.password,
    port     : config.server.mysql.port,
    database : config.server.mysql.database 
});
connection.connect();

// api HTML 模块
app.get('/', function(req, res){
  res.render('index',{
    config: config.main,
    session: req.session,
    title: '首页'
  });
});
app.post('/api/user/login', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  let username = validator.escape(req.body.username);
  let password = validator.escape(req.body.password);
  password = setpassword(password,config.server.md5key);
  let sql = `SELECT * FROM users WHERE name = \'${username}\'`;
  connection.query(sql,function (err, result) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
    if(result.length == 0) {
      res.json({code:"NO"});
    } else {
      if(password == result[0].password) {
        req.session.user = result[0];
        res.json({code:"OK"});
      } else {
        res.json({code:"NO"});
      }
    }
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

app.server.listen(config.server.port, function(){
  console.log('[index.js]: listening on *:' + config.server.port);
});