//router
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
const middleware = require('../middleware')
const MemberModifyMethod = require('../controllers/modify_controller');
const { render } = require('ejs');

const MemberModify = new MemberModifyMethod();
/* GET home page. */
router.get('/',middleware.isloggedIn,function(req, res, next) {
    res.redirect('/user')
})
/* 會員註冊 */
router.get('/register',function(req, res){
  res.render('register');
})
/* 會員登入 */
router.get('/login',function(req, res){
  res.render('login');
})


/*User Action*/
//post登入
router.post('/login', MemberModify.postLogin);
//post註冊
router.post('/register',MemberModify.postRegister);
//get登出
router.get('/logout',MemberModify.postLogout);

module.exports = router;
