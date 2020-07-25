//密碼加密模組
const crypto = require('crypto');

module.exports =function hashPassword(password) {
    let hashPassword = crypto.createHash('sha1');
    hashPassword.update(password);
    const rePassword = hashPassword.digest('hex')
    return rePassword
}