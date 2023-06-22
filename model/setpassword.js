const crypto = require("crypto");

function setpassword(password,key){
    var password=`|${pwd}|${key}|`
    const md5 = crypto.createHash('md5');
    md5.update(password);
    password = md5.digest('hex');
    md5.update(password);
    password = md5.digest('hex');
    md5.update(password);
    var newpassword = md5.digest('hex');
    return newpassword;
}

module.exports=setpassword