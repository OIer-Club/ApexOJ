const crypto = require("crypto");

function tomd5(pwd,key){
    let password=`${pwd}|${key}`
    const md5 = crypto.createHash('md5');
    md5.update(password);
    var newpwd=md5.digest('hex');
    return newpwd;
}

function setPassword(pwd,key) {
    pwd = tomd5(pwd,key);
    pwd = tomd5(pwd,key);
    pwd = tomd5(pwd,key);
    return pwd;
}

module.exports=setPassword