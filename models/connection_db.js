//建立sqlite資料庫連結
const sqlite3 = require('sqlite3').verbose();

const path = 'Memberdata.db'
let db = new sqlite3.Database(path,sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
    console.error(err.message);
    }
    console.log('Connected to the '+path);
});


module.exports = db

