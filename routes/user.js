var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
const verification = require('../models/verification')
const verify = new verification();
const middleware = require('../middleware')
const UserModifyMethod = require('../controllers/user_modify');
const { render } = require('ejs');
const UserModify   = new UserModifyMethod();
const db = require('../models/connection_db');


router.get("/",middleware.checktoken,UserModify.userGuildsys);

router.get('/background',middleware.checktoken,(req,res)=>{
    var decoded = verify.decodeToken(req.cookies.access_token)
    getUserSql(decoded).then(member => {
        res.render("userpage/bg",{currentUser:member})
})});

//user/findguild
//location.href='user/buildguild

//client上傳圖片
router.post('/changebg',UserModify.postChangebg);
//使用預設圖片
router.get("/apply/:src",UserModify.getApplybg)


function getUserSql(id){
    return new Promise(function(resolve, reject){
        let sqlforGuild = 'SELECT guild_name FROM Guild WHERE guild_id = :1'
        let sqlforUser = 'SELECT name,id,bg_image,guild_id FROM Users WHERE id = :1'
        db.each(sqlforUser,[id],(err,member)=>{
            if(member.guild_id===null){
                resolve(member)
            }else{
                db.each(sqlforGuild,[member.guild_id],(err,rows)=>{
                    member = Object.assign(member,rows)
                    resolve(member)
                })
            }
        })
    })
}

module.exports = router;