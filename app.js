var createError = require('http-errors');
var express     = require('express');
var path        = require('path');
var cookieParser = require('cookie-parser');
var logger      = require('morgan');
var session     = require('express-session');
var flash       = require('connect-flash');
var app = express();
//Router 
var indexRouter = require('./routes/index');
var userRouter = require("./routes/user")
var guildRouter =require('./routes/guild')

// view engine setup
app.use(session({ cookie: { maxAge: 60000 }, 
  secret: 'guild war for prct',
  resave: false, 
  saveUninitialized: false}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));
app.use(flash())
app.use(function (req, res, next){
  res.locals.currentUser = req.cookies.access_token
  res.locals.error = req.flash("error")
  res.locals.success = req.flash("success")
  next()
})


app.use('/', indexRouter);
app.use('/user',userRouter);
app.use('/user/guild',guildRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error/error');
});

module.exports = app;
