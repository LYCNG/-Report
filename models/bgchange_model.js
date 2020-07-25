const db = require('./connection_db');

module.exports = function bgtransform(memberData){
    let result = {};
    return new Promise((resolve, reject) => {
        db.all('UPDATE Users SET bg_image = :1 WHERE id = :2', [memberData.image,memberData.id], function (err, rows) {
            if (err) {
                console.log(err)
                result.status = "會員資料更新失敗。"
                reject(result);
                return;
            }
            result.status = "背景圖片更新成功。"
            resolve(result)
        })
    })
}