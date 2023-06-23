var express = require('express');
var app = express.Router();

const fs = require('fs');
const path = require('path');

const validator = require('validator');
const moment = require('moment');
const date = moment();

// 读取 config
var config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config", 'config.json'), { encoding: 'utf8', flag: 'r' }).toString());

const setpassword = require('./setpassword');
const stringRandom = require('string-random');

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

app.post('/discuss/new', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (!req.body.title || !req.body.content) {
        res.json({ code: "ERROR", message: 'NO DATA' });
        return;
    }

    if (!req.session.user) {
        res.json({ code: "NO", message: '您未登入' });
        return;
    }
    if (req.session.user.is_ban_discuss) {
        res.json({ code: "NO", message: '您被禁止发布讨论' });
        return;
    }

    let title = validator.escape(req.body.title);
    let content = validator.escape(req.body.content);
    let user = req.session.user.id;
    let time = date.format('YYYY-MM-DD hh:mm:ss');

    let sql = `INSERT INTO discuss_list (title,content,user,time) VALUES (\'${title}\',\'${content}\',\'${user}\',\'${time}\')`;
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
            return;
        }
        if (!result) {
            res.json({ code: "NO", message: "???" });
        } else {
            res.json({ code: "OK", newID: result.insertId });
        }
    });
});

app.post('/discuss/:id/new', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (!req.body.content) {
        res.json({ code: "ERROR", message: 'NO DATA' });
        return;
    }

    if (!req.session.user) {
        res.json({ code: "NO", message: '您未登入' });
        return;
    }
    if (req.session.user.is_ban_discuss) {
        res.json({ code: "NO", message: '您被禁止发布讨论' });
        return;
    }

    let discuss_id = validator.escape(req.params.id);
    let content = validator.escape(req.body.content);
    let user = req.session.user.id;
    let time = date.format('YYYY-MM-DD hh:mm:ss');

    let sql = `SELECT * FROM discuss_list WHERE id = '${discuss_id}'`;
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
            return;
        }
        if (result.length == 0) {
            res.json({ code: "NO", message: '无此讨论' });
            return;
        }
    
        sql = `INSERT INTO discuss_content (discuss_id,content,user,time) VALUES (\'${discuss_id}\',\'${content}\',\'${user}\',\'${time}\')`;
        connection.query(sql, function (err, result) {
            if (err) {
                res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
                return;
            }
            if (!result) {
                res.json({ code: "NO", message: "???" });
            } else {
                res.json({ code: "OK", newID: result.insertId });
            }
        });
    });
});

app.post('/discuss/:id/edit', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let id = validator.escape(req.params.id);
    if (!req.session.user) {
        res.json({ code: "NO", message: '您未登入' });
        return;
    }
    if (req.session.user.is_ban_discuss) {
        res.json({ code: "NO", message: '您被禁止发布讨论' });
        return;
    }

    let sql = `SELECT * FROM discuss_list WHERE id = '${id}'`;
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
            return;
        }
        if (result.length == 0) {
            res.json({ code: "NO", message: '无此讨论' });
            return;
        }

        // 不是楼主 且 不是管理员
        if (result[0].user != req.session.user.id && !req.session.user.isadmin) {
            res.json({ code: "NO", message: '你无权进行此操作' });
            return;
        }

        let title = validator.escape(req.body.title);
        let content = validator.escape(req.body.content);
        // 修改数据库
        sql = `UPDATE discuss_list SET title = '${title}', content = '${content}' WHERE id = '${id}'`;
        connection.query(sql, function (err, result) {
            if (err) {
                res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
                return;
            }
            res.json({ code: "OK" });
        });
    });
});

app.post('/discuss/:id/delete', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let id = validator.escape(req.params.id);
    if (!req.session.user) {
        res.json({ code: "NO", message: '您未登入' });
        return;
    }

    let sql = `SELECT * FROM discuss_list WHERE id = '${id}'`;
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
            return;
        }
        if (result.length == 0) {
            res.json({ code: "NO", message: '无此讨论' });
            return;
        }

        // 不是楼主 且 不是管理员
        if (result[0].user != req.session.user.id && !req.session.user.isadmin) {
            res.json({ code: "NO", message: '你无权进行此操作' });
            return;
        }

        // 修改数据库
        sql = `UPDATE discuss_list SET hidden = true WHERE id = '${id}'`;
        connection.query(sql, function (err, result) {
            if (err) {
                res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
                return;
            }
            res.json({ code: "OK" });
        });
    });
});

app.post('/discuss/:discuss_id/:content_id/delete', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let discuss_id = validator.escape(req.params.discuss_id);
    let content_id = validator.escape(req.params.content_id);
    if (!req.session.user) {
        res.json({ code: "NO", message: '您未登入' });
        return;
    }

    let sql = `SELECT * FROM discuss_content WHERE id = '${content_id}' AND discuss_id = '${discuss_id}'`;
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
            return;
        }
        if (result.length == 0) {
            res.json({ code: "NO", message: '无此讨论' });
            return;
        }

        // 不是发者 且 不是管理员
        if (result[0].user != req.session.user.id && !req.session.user.isadmin) {
            res.json({ code: "NO", message: '你无权进行此操作' });
            return;
        }

        // 修改数据库
        sql = `UPDATE discuss_content SET hidden = true WHERE id = '${content_id}' AND discuss_id = '${discuss_id}'`;
        connection.query(sql, function (err, result) {
            if (err) {
                res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message });
                return;
            }
            res.json({ code: "OK" });
        });
    });
});

app.post('/user/find', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let userlist = new Array();
    let type = 'id';
    if (!req.body.type && !req.body.userlist) {
        res.json({ code: "ERROR", message: 'NO DATA' });
        return;
    } else {
        userlist = validator.escape(req.body.userlist);
        type = validator.escape(req.body.type);
    }

    let sql = `SELECT * FROM users WHERE ${type} in (${userlist}) group by ${type}`;
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({ code: "ERROR", message: '[SELECT ERROR] - ' + err.message + sql });
            return;
        }
        userlist = result;
        for (let i = 0; i < userlist.length; i++) {
            delete userlist[i].password;
        }
        res.json({ code: "OK", userlist: userlist });
    });
});

app.post('/user/login', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (!req.body.username || !req.body.password) {
        res.json({ code: "ERROR", message: 'NO DATA' });
        return;
    }

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

app.post('/user/email_key', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (!req.body.token || !req.body.email_key) {
        res.json({ code: "ERROR", message: 'NO DATA' });
        return;
    }

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

app.post('/user/register', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (!req.body.username || !req.body.password || !req.body.email) {
        res.json({ code: "ERROR", message: 'NO DATA' });
        return;
    }

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
                                res.json({ code: "NO", message: "邮件发送失败，请重试。多次失败请联系管理员。" + err });
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

app.post('/user/logout', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    req.session.user = undefined;
    res.json({ code: "OK" });
});

module.exports = app