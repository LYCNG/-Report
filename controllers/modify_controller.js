/*中控模組*/ 
//models data function called
const toRegister = require('../models/register_model');
const loginAction = require('../models/login_model')
const hashPassword = require('../models/passwordhasher')

//other function 
const config = require('../config/development_config');//環境變數

const Check = require('../service/member_check');//格式檢驗
check = new Check();//檢查email是否符合格式

const jwt = require('jsonwebtoken');//import 模組


module.exports = class Member {
    //post申請的function   
    postRegister(req, res, next) {
        // 獲取client端資料
        const password = hashPassword(req.body.password);
        const memberData = {
            name: req.body.name,
            email: req.body.email,
            password: password
        }
        const checkEmail = check.checkEmail(memberData.email)
         // 不符合email格式
        if (checkEmail === false) {
            req.flash('error',"註冊失敗，請輸入正確的Eamil格式。(如1234@email.com)")
            res.redirect("/register")
        // 若符合email格式
        }else if(checkEmail===true){
            // 將資料寫入資料庫
            toRegister(memberData).then(result => {
                // 若寫入成功則回傳
                req.flash('success',result.status)
                res.redirect("/login")
            }, err => {
                // 若寫入失敗則回傳
                req.flash("error",err.status+err.err)
                res.redirect("/register")
            })
        }
    }
    //post登入的function    
    postLogin(req, res,next) {
        const password = hashPassword(req.body.password)
        const memberData = {
            name: req.body.name,
            email: req.body.email,
            password: password
        }
        console.log(memberData)
        loginAction(memberData).then(rows => {
            //產生token
            const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8), // token 8個小時後過期。
            //將會員的id放進去token的生成規則中，如果會員想修改自己的資料，可以根據token來反推出是哪個會員的id，透過這個id就能指定資料庫要修改哪筆會員資料。
            data: rows[0].id
            }, config.secret);
            req.flash("success","登入成功!!!")
            res.cookie('access_token',token).redirect("/")    
            }
        ).catch(result=>{
            req.flash("error",result.status+result.err)
            res.redirect("/login")
        })
    }
    postLogout(req, res, next) {
        res.clearCookie('access_token')
        req.flash("success",'登出成功!!!')
        res.redirect("/") 
    }
}
