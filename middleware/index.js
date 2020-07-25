const db = require("../models/connection_db")
const verification = require('../models/verification')
const verify = new verification();
//all the middleware
var middlewareObj ={}

middlewareObj.checktoken=function(req,res, next){
    const token = req.cookies.access_token
    if(!token){
        req.flash("error", "請先登入。")
        res.redirect('/login');
    }else{
        verify.verifyToken(token).then(tokenResult => {
            if(tokenResult===false){
                res.clearCookie('access_token')
                req.flash("error", "驗證已過期，請重新登入。")
                res.redirect('/login');
            }else{
                next()
            }
    })}
}

middlewareObj.isloggedIn = function (req, res, next) {
    const token = req.cookies.access_token
    if(!token){
        //還未登入時回傳原畫面
        res.render("index")
    }else{
        next()
    }
}

middlewareObj.ifloggedIn =function (req, res, next) {
    const token = req.cookies.access_token
    if(!token){
        next()
    }else{
        req.flash('error', "您已經登入，請先登出再繼續。")
        res.redirect('/')
    }
}

middlewareObj.nologgedIn =function(req, res, next){
    const token = req.cookies.access_token
    if(!token){
        req.flash("error", "您並未登入")
        redirect("/")
    }else{
        next()
    }
}

//index >> if login >> return userpage || if not >> return index
//login >>  if login >>return error|| if not >> return login page
//register >>if login >> return error || if not return register page
//background >>  if login >> return bg page || if not return login page


module.exports = middlewareObj