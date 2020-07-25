//登入模組
const db = require('./connection_db');

module.exports = function memberLogin(memberData) {
    let result = {};
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Users WHERE name = :1 AND email= :2 AND password=:3",[memberData.name, memberData.email, memberData.password],(err, rows)=> {
            if (rows.length === 0) {
                result.status = "登入失敗。"
                result.err = "帳號或密碼錯誤，請重新登入。"
                reject(result);
            }else{
                resolve(rows);
            }
        });
    });
}