const verification = require('../models/verification')
const verify = new verification();
const db = require('../models/connection_db');
const { GatewayTimeout } = require('http-errors');
const stagesys = require('../models/stageweek_models')
const status = new stagesys
var insertsql ="INSERT INTO Guild (guild_id,creater_id,guild_name,invite_code,guild_member) VALUES (:1,:2,:3,:4,:5)"
var insertRecord = "INSERT INTO Record (guild_id,date,user_id,user_name,week,boss,damage,comment,totally) VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9)"
const bosshealth=[600,800,1000,1200,2000]

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


module.exports = class GuildSystem{
    buildGuild(req,res){
        var decodeId = verify.decodeToken(req.cookies.access_token)
        db.all('SELECT creater_id FROM Guild WHERE creater_id = ?', decodeId, function (err, rows){
            if(rows.length >= 1){
                req.flash("error","你已經有戰隊了")
                res.redirect("/user")
            }else{
                const guild_id = (Math.floor(Math.random()*(10000-99+1))+99).toString() //轉token maybe
                db.all(insertsql,[guild_id, decodeId, req.body.guild_name, req.body.invite_code, 1],(err, rows)=>{
                    if(err){
                        res.send(err)
                    }else{
                        db.all("UPDATE Users SET guild_id =:1 WHERE id=:2",[guild_id,decodeId],(err, rows)=>{
                            if(err){
                                res.send(err)
                            }else{
                                req.flash("success","戰隊創立成功")
                                res.redirect("/user")
                            }
                        })
                    }
                })
            }
        })
    }
    guildrecord(req,res){
        var decodeId = verify.decodeToken(req.cookies.access_token)
        getUserSql(decodeId).then(member=>{
            db.get("SELECT guild_id FROM Users WHERE id =:1",[decodeId],(err,rows)=>{
                db.all('SELECT * FROM Record WHERE guild_id=:1 order by date DESC',[rows.guild_id],(err,result)=>{
                    res.render('guild/recordpage',{currentUser:member,records:result})
                })
            })
        })
    }
    runFight(req,res){
        var decodeId = verify.decodeToken(req.cookies.access_token)
        db.get('SELECT guild_id,name FROM Users WHERE id = :1',[decodeId],(err,rows)=>{
            var today = new Date()
            var DateTime =today.getFullYear()+"/"+(today.getMonth()+1)+"/"+today.getDate()+" "+today.getHours()+':'+today.getMinutes()
            const battle = {
                guild_id: rows.guild_id,
                date:DateTime,
                user_id:decodeId,
                user_name:rows.name,
                week:req.body.week,
                boss:req.body.boss,
                damage:req.body.damage,
                comment:req.body.comment,
                total: req.body.damage * status.getper(req.body.week,req.body.boss)
            }
            db.all(insertRecord,[battle.guild_id,battle.date,battle.user_id,battle.user_name,battle.week,battle.boss,battle.damage,battle.comment,battle.total],(err,result)=>{
                if(err){
                    req.flash("error","資料儲存失敗")
                    res.redirect("/user/guild/runfight")
                }else{
                    req.flash("success","出刀完成!!")
                    res.redirect("/user/guild/runfight")
                }
            })
        })
    }
    joinGuild(req, res){
        var decodeId = verify.decodeToken(req.cookies.access_token)

        db.get("SELECT guild_id FROM Guild WHERE invite_code = :1",req.body.invite_code,(err,rows)=>{
            if(!rows){
                req.flash("error","邀請碼錯誤，請重新輸入")
                res.redirect("/user/guild/findguild")
            }else{
                db.all("SELECT id FROM Users WHERE guild_id = :1",rows.guild_id,(err,member)=>{
                    if(member.length>=30){
                        req.flash("error","戰隊成員已滿。")
                        res.redirect("/user/guild/findguild")
                    }else{
                        db.all("UPDATE Users SET guild_id = :1 WHERE id = :2",[rows.guild_id,decodeId],(err,rows)=>{
                            if(err){
                                req.flash("error","伺服器錯誤，請重新嘗試")
                                res.redirect("/user/guild/findguild")
                            }else{
                                req.flash("success","加入戰隊完成，可以出刀囉~!")
                                res.redirect("/user")
                            }
                        })
                    }
                })
            }
        })
    }
    fightsys(req, res){
        var decodeId = verify.decodeToken(req.cookies.access_token)
        db.get('SELECT guild_id FROM Users WHERE id = :1',decodeId,(err,rows)=>{
            db.get("SELECT Max(week) FROM Record where guild_id = :1",rows.guild_id,(err,current)=>{
                if(!current){
                    const currentboss={boss:1,stage:status.getstage(1,1),healthbar:bosshealth[0],remainder:bosshealth[0],week:1}
                
                    getUserSql(decodeId).then(member=>{
                        res.render("guild/fightpage",{currentUser:member,currentboss:currentboss})
                    })
                }else{
                    db.get("SELECT SUM(damage),Max(boss) FROM Record WHERE guild_id = :1 AND week = :2",[rows.guild_id,current["Max(week)"]],(err,now)=>{
                        const result = status.setBoss(now["Max(boss)"],now["SUM(damage)"],current["Max(week)"]) 
                        var perhp = (result.health / (bosshealth[result.boss-1]*10000))*100
                        const currentboss ={boss:result.boss,remainder:result.health,stage:status.getstage(result.week,result.boss),healthbar:bosshealth[result.boss-1],week:result.week,perhp:perhp}
                        getUserSql(decodeId).then(member=>{
                            res.render("guild/fightpage",{currentUser:member,currentboss:currentboss})
                        })
                    })
                }
            })
        })
    }
    memberBan(req,res){
        var decodeId = verify.decodeToken(req.cookies.access_token)
        db.get("SELECT creater_id FROM Guild WHERE creater_id = :1",123,(err,rows)=>{
            if(!rows){
                req.flash("error","您不是隊長，無法進行此操作")
                res.redirect("/user")
            }else{
                pass
            }
        })
    }
}


