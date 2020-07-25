const updateAction = require('../models/update_model')
const bgtransform = require('../models/bgchange_model')
const verification = require('../models/verification')
const verify = new verification();
const config = require('../config/development_config');//環境變數
const db = require('../models/connection_db');
const Check = require('../service/member_check');//格式檢驗
check = new Check();//檢查email是否符合格式

const defaultbg = {
    "peko":"https://i.imgur.com/iRXbYpT.png",
    "kyaru":"https://i.imgur.com/5QyPJnf.jpg",
    "kokoro":"https://i.imgur.com/iwIgNiM.png"
}
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

module.exports = class userAgent{
    postChangebg(req, res, next){
        const token = req.cookies.access_token
        verify.verifyToken(token).then(tokenResult => {
                if (tokenResult === false ) {
                    //如果token過期
                    req.flash("error","請重新登入。")
                    res.redirect('/login');
                } else {
                    const memberData={
                        id:tokenResult,
                        image: req.body.image 
                    }      
                    bgtransform(memberData).then(result => {
                        req.flash("success",result.status)
                        res.redirect("/")
                    },err =>{
                        req.flash('error',err.status)
                        res.redirect('/background')
                    })
                }
        })
    }
    getApplybg(req, res, next){
        const token = req.cookies.access_token
        verify.verifyToken(token).then(tokenResult => {
            if (tokenResult === false ) {
                //如果token過期
                req.flash("error","請重新登入。")
                res.redirect('/login');
            } else {
                const memberData={
                    id:tokenResult,
                    image: defaultbg[req.params.src]
                }      
                bgtransform(memberData).then(result => {
                    req.flash("success",result.status)
                    res.redirect("/user")
                },err =>{
                    req.flash('error',err.status)
                    res.redirect('/user/background')
                })
            }
    })
    }
    //先不用管
    postUpdate(req, res, next){
        const token = req.cookies.access_token
    //確定token是否有輸入
        if (check.checkNull(token) === true) {
                res.json({
                err: "請輸入token！"
            })
        } else if (check.checkNull(token) === false) {
        verify.verifyToken(token).then(tokenResult => {
                if (tokenResult === false ) {
                    console.log("token錯誤，請重新登入。")
                    res.render("/login")
                } else {
                    const id = tokenResult;//id為反驗證後的資料:name
                    const password = hashPassword(req.body.password);
                    const memberUpdateData = {
                        name: req.body.name,
                        password: password
                    }
                    console.log(Object.values(memberUpdateData))
                    updateAction(id, memberUpdateData).then(result => {
                        res.json({
                            result: result
                        })
                    }),(err)=>{
                        res.json({
                            result: err
                        })
                    }
                }
            })
        }
    }
    userGuildsys(req,res){
        var decoded = verify.decodeToken(req.cookies.access_token)
        db.get('SELECT guild_id,name FROM Users WHERE id = :1',decoded,(err,user)=>{
            db.get("SELECT SUM(totally) FROM Record WHERE user_id = :1",decoded,(err,you)=>{
                db.get("SELECT SUM(totally) FROM Record where guild_id = :1",user.guild_id,function(err,now){
                    db.all("SELECT name FROM Users where guild_id=:1",user.guild_id,function(err,rows){
                        const guildinform = {
                                total:now["SUM(totally)"],
                                yourtotal:you["SUM(totally)"],
                                totalmembers:rows.length,
                                member:rows,
                                you:user.name,
                            }
                        getUserSql(decoded).then(member => {
                            res.render("userpage/user",{currentUser:member,guildinform:guildinform})
                        })  
                    })
                })
            })
        })
    }
}
