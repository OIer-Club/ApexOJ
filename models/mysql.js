const fs = require('fs');
const path = require('path');

// 读取 config
let config = JSON.parse(fs.readFileSync(path.join(__dirname + "/config", 'config.json'), {encoding: 'utf8',flag: 'r'}).toString());

// 还没写。