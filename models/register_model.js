//註冊模組
const db = require('./connection_db');

module.exports = function register(memberData) {
    let result = {};
    return new Promise((resolve, reject) => {
        // 尋找是否有重複的email
        db.all('SELECT email FROM Users WHERE email = ?', memberData.email, function (err, rows) {
            // 若資料庫部分出現問題，則回傳給client端「伺服器錯誤，請稍後再試！」的結果。
            if (err) {
                result.status = "Email失敗"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
                return;
            }
            // 如果有重複的email
            if (rows.length >= 1) {
                result.status = "註冊失敗。";
                result.err = "已有重複的Email。";
                reject(result);
            } else {
                // 將資料寫入資料庫
                db.all(`SELECT COUNT(*) FROM Users`,(err, rows)=>{
                    const id = rows[0]['COUNT(*)'] + 2
                    db.all('INSERT INTO Users (name,email,password,id,bg_image) VALUES (:1,:2,:3,:4,:5)', [memberData.name,memberData.email,memberData.password,id,"https://i.imgur.com/iRXbYpT.png"], function (err, rows) {
                        // 若資料庫部分出現問題，則回傳給client端「伺服器錯誤，請稍後再試！」的結果。
                        if (err) {
                            result.status = "資料儲存失敗";
                            result.err = "伺服器錯誤，請稍後在試！"
                            reject(result);
                            return;
                        }else{        
                            result.status = "註冊成功，請重新登入"
                            resolve(result);
                            return// 若寫入資料庫成功，則回傳給clinet端下：}
                    }})
                })
            }
        })
    })
}

//const memberData = {name: "reqdfwqdwdwqame",email: "req.qwdwqd",password: "reqsqdwqdwqd"}
//console.log(register(memberData))
