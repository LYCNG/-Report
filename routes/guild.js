var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
const verification = require('../models/verification')
const verify = new verification();
const db = require('../models/connection_db');
const middleware = require('../middleware')
const { render } = require('ejs');
const guildaciotn= require('../controllers/guild_controller')
const guild = new guildaciotn();

router.get('/', function(req, res){
    res.send("this is guild home")
})

//創建戰隊
router.get("/buildguild",middleware.checktoken,function(req,res){
    var decoded = verify.decodeToken(req.cookies.access_token)
    getUserSql(decoded).then(member => {
        res.render("guild/buildguild",{currentUser:member})
    })
})
//尋找戰隊
router.get("/findguild",middleware.checktoken,function(req,res){
    var decoded = verify.decodeToken(req.cookies.access_token)
    getUserSql(decoded).then(member => {
        res.render("guild/findguild",{currentUser:member})
    })
})
//出刀頁面
router.get("/runfight",middleware.checktoken,guild.fightsys)
//出刀紀錄頁面
router.get("/record",middleware.checktoken,guild.guildrecord)

router.get("/ban",guild.memberBan)
//*post*//

router.post("/building",middleware.checktoken,guild.buildGuild)
router.post("/runfight",middleware.checktoken,guild.runFight)
router.post("/join",middleware.checktoken,guild.joinGuild)



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