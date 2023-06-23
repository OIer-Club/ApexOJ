const http = require('http');
const session = require('express-session');
let Express = require('express');
global.app = Express();

const fs = require('fs');
const path = require('path');

const validator = require('validator');

const bodyParser = require('body-parser');
// 配置body-parser
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())

// 读取 config
var config = JSON.parse(fs.readFileSync(path.join(__dirname + "/config", 'config.json'), { encoding: 'utf8', flag: 'r' }).toString());

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
var api = require('./model/api');
app.use('/api', api);

app.get('/', function (req, res) {
  res.render('index', {
    config: config.main,
    session: req.session,
    title: '首页'
  });
});
app.get('/discuss', function (req, res) {
  let page = 1;
  if (req.query.page && req.query.page > 0) {
    page = req.query.page;
  }
  let firstlist = 10 * (page - 1);
  let endlist = 10 * page;

  let discuss = {};

  // 读取数据库 discuss_list 表 逆序 10条
  let sql = `SELECT * FROM discuss_list ORDER BY id DESC LIMIT ${firstlist},${endlist};`;
  connection.query(sql, function (err, result) {
    if (err) {
      discuss = { code: "ERROR", message: '[SELECT ERROR] - ' + err.message };
    } else {
      if(result.length == 0 && page != 1) {
        discuss.code = "NO";
        discuss.message = "此页面无讨论";
      } else {
        discuss.list = result;
        discuss.code = "OK";
      }
    }
    if (discuss.code == "OK") {
      res.render('discuss_list', {
        config: config.main,
        session: req.session,
        title: '讨论列表',
        discuss: discuss,
        page: page
      });
    } else {
      res.render('error', {
        config: config.main,
        session: req.session,
        title: '错误',
        err: discuss
      });
    }
  });
});
app.get('/discuss/:id', function (req, res) {
  let discuss_id = validator.escape(req.params.id);

  let page = 1;
  if (req.query.page && req.query.page > 0) {
    page = req.query.page;
  }
  let firstlist = 10 * (page - 1);
  let endlist = 10 * page;

  let discuss = {};

  let sql = `SELECT * FROM discuss_list WHERE id = '${discuss_id}'`;
  connection.query(sql, function (err, result) {
    if (err) {
      discuss = { code: "ERROR", message: '[SELECT ERROR] - ' + err.message };
    } else {
      if (result.length == 0) {
        discuss_content = { code: "NO", message: '无此讨论' };
      } else {
        discuss.main = result[0];
        discuss.code = "OK";
      }
    }
    if (discuss.code == "OK") {
      // 读取数据库 discuss_content 表 10 条
      let sql = `SELECT * FROM discuss_content WHERE discuss_id = '${discuss_id}' LIMIT ${firstlist},${endlist};`;
      connection.query(sql, function (err, result) {
        if (err) {
          discuss = { code: "ERROR", message: '[SELECT ERROR] - ' + err.message };
          return;
        }
        discuss.content = result;
        res.render('discuss_content', {
          config: config.main,
          session: req.session,
          title: discuss.main.title + ' - 讨论',
          discuss: discuss,
          page: page
        });
      });
      if(discuss.code != "OK") {
        res.render('error', {
          config: config.main,
          session: req.session,
          title: '讨论不存在',
          err: discuss
        });
      }
    }
  });
});
app.get('/discuss/:id/edit', function (req, res) {
  let discuss_id = validator.escape(req.params.id);

  if (!req.session.user) {
    res.render('error', {
      config: config.main,
      session: req.session,
      title: '你未登入',
      err: { code: "NO", message: "未登入" }
    });
    return;
  }

  if (!req.session.user.isadmin) {
    res.render('error', {
      config: config.main,
      session: req.session,
      title: '你无权限修改讨论',
      err: { code: "NO", message: "你无权限修改讨论" }
    });
    return;
  }

  let sql = `SELECT * FROM discuss_list WHERE id = '${discuss_id}'`;
  connection.query(sql, function (err, result) {
    let discuss = {};
    if (err) {
      discuss = { code: "ERROR", message: '[SELECT ERROR] - ' + err.message };
    } else {
      if (result.length == 0) {
        discuss = { code: "NO", message: '无此讨论' };
      } else {
        discuss.main = result[0];
        discuss.code = "OK";
      }
    }
    if (discuss.code == "OK") {
      res.render('discuss_edit', {
        config: config.main,
        session: req.session,
        title: '编辑讨论',
        discuss: discuss
      });
    } else {
      res.render('error', {
        config: config.main,
        session: req.session,
        title: '讨论不存在',
        err: discuss
      });
    }
  });
});
app.get('/user/email_key', function (req, res) {
  res.render('email_key', {
    config: config.main,
    session: req.session,
    title: '注册验证'
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
    socket.emit("online", {});
  });
  socket.on('disconnect', function () {
    io.emit("online", {});
  });
});

app.server.listen(config.server.port, function () {
  console.log('[index.js]: listening on *:' + config.server.port);
});