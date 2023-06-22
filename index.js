const http = require('http');
const session = require('express-session');
let Express = require('express');
global.app = Express();

const fs = require('fs');
const path = require('path');

const validator = require('validator');
const setpassword = require('./model/setpassword');
const stringRandom = require('string-random');

const bodyParser = require('body-parser');
// 配置body-parser
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())

// 读取 config
var config = JSON.parse(fs.readFileSync(path.join(__dirname + "/config", 'config.json'), { encoding: 'utf8', flag: 'r' }).toString());

// SMTP发送邮件
const nodemailer = require("nodemailer");
const smtpTransport = nodemailer.createTransport({
  host: config.server.smtp.host,
  secureConnection: false, // use SSL
  secure: false,
  port: config.server.smtp.port,
  auth: {
    user: config.server.smtp.account,
    pass: config.server.smtp.pwd,
  }
});

// Set template engine ejs
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
// Set assets dir
app.use(Express.static(__dirname + "/static", { maxAge: '1y' }));
// Set Session
app.use(session({
  secret: config.server.session_token,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3 * 24 * 60 * 60 } /* 第一个参数：只有在https才可以访问cookie；第二个参数：设置cookie的过期时间 */
}))

app.server = http.createServer(app);

// MySQL
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: config.server.mysql.host,
  user: config.server.mysql.user,
  password: config.server.mysql.password,
  port: config.server.mysql.port,
  database: config.server.mysql.database
});
connection.connect();

// api HTML 模块
app.get('/', function (req, res) {
  res.render('index', {
    config: config.main,
    session: req.session,
    title: '首页'
  });
});
app.get('/user/email_key', function (req, res) {
  res.render('email_key', {
    config: config.main,
    session: req.session,
    title: '注册验证'
  });
});
app.post('/api/user/login', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  let username = validator.escape(req.body.username);
  let password = validator.escape(req.body.password);
  password = setpassword(password, config.server.md5key);
  let sql = `SELECT * FROM users WHERE name = \'${username}\'`;
  connection.query(sql, function (err, result) {
    if (err) {
      res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
      return;
    }
    if (result.length == 0) {
      res.json({ code: "NO" });
    } else {
      if (password == result[0].password) {
        req.session.user = result[0];
        res.json({ code: "OK" });
      } else {
        res.json({ code: "NO" });
      }
    }
  });
});
app.post('/api/user/email_key', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  let token = validator.escape(req.body.token);
  let email_key = validator.escape(req.body.email_key);
  let sql = `SELECT * FROM casual_users WHERE token = \'${token}\'`;
  connection.query(sql, function (err, result) {
    if (err) {
      res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
      return;
    }
    if (result.length == 0) {
      res.json({ code: "NO", message: "Token不存在！" });
    } else {
      if (email_key == result[0].email_key) {
        sql = `INSERT INTO users (name,password,email,avatar) VALUES (\'${result[0].name}\',\'${result[0].password}\',\'${result[0].email}\',\'\')`;
        connection.query(sql, function (err, result) {
          if (err) {
            res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
            return;
          }

          // 删除原有验证 token
          sql = `DELETE FROM casual_users WHERE token = \'${token}\'`;
          connection.query(sql, () => { });

          res.json({ code: "OK" });
        });
      } else {
        res.json({ code: "NO", message: "Key错误！" });
      }
    }
  });
});
app.post('/api/user/register', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  let username = validator.escape(req.body.username);
  let password = validator.escape(req.body.password);
  password = setpassword(password, config.server.md5key);
  let email = validator.escape(req.body.email);
  let token = stringRandom(32, { specials: false });
  let email_key = stringRandom(32, { specials: false });

  if (username.length < 5) {
    res.json({ code: "NO", message: "用户名太短" });
    return;
  }

  // 去除原有列表内未验证数据
  var iserror = false;
  let sql = `SELECT * FROM casual_users WHERE name = \'${username}\' OR email = \'${email}\'`;
  connection.query(sql, function (err, result) {
    if (err) {
      iserror = true;
      res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
      return;
    }
    if (result.length != 0) {
      sql = `DELETE FROM casual_users WHERE name = \'${username}\' OR email = \'${email}\'`;
      connection.query(sql, () => { });
    }
  });
  if (iserror) {
    return;
  }

  // 查看用户名/油箱时候会重复
  sql = `SELECT * FROM users WHERE name = \'${username}\' OR email = \'${email}\'`;
  connection.query(sql, function (err, result) {
    if (err) {
      res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
      return;
    } else {
      if (result.length != 0) {
        res.json({ code: "NO", message: "用户名/油箱重复" });
      } else {
        sql = `INSERT INTO casual_users (name,password,email,token,email_key) VALUES (\'${username}\',\'${password}\',\'${email}\',\'${token}\',\'${email_key}\')`;
        connection.query(sql, function (err, result) {
          if (err) {
            res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
            return;
          }
          if (!result) {
            res.json({ code: "NO", message: "???" });
          } else {
            smtpTransport.sendMail({
              from: `${config.main.title} <${config.server.smtp.account}>`,
              to: email,
              subject: `${config.main.title}注册验证邮件`,
              html: `您的 Key: ${email_key} <br/> <a href="http://${config.main.host}/user/email_key?token=${token}&key=${email_key}">点击此链接一键注册</a> <br/> 如果不是您注册请忽略此邮件`
            }, function (err, result) {
              if (err) {
                res.json({ code: "NO", message: "邮件发送失败，请重试。多次失败请联系管理员。"+err });
              } else {
                res.json({ code: "OK", token: token });
              }
            });
          }
        });
      }
    }
  });
});
app.post('/api/user/logout', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  req.session.user = undefined;
  res.json({ code: "OK" });
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
    socket.emit("online", {});
  });
  socket.on('disconnect', function () {
    io.emit("online", {});
  });
});

app.server.listen(config.server.port, function () {
  console.log('[index.js]: listening on *:' + config.server.port);
});