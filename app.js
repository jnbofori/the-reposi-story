const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require("mysql");
const session = require('express-session');
const hbs = require('express-handlebars');
const flash = require('express-flash');
const methodOverride = require('method-override');
const logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
var writersRouter = require('./routes/writers');
var postsRouter = require('./routes/posts');
var homeRouter = require('./routes/home');
var profileRouter = require('./routes/profile');

var app = express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'connect',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

let con = mysql.createConnection({
  host: "us-cdbr-east-05.cleardb.net",
  user: "bccd983954c987",
  password: "b7104204",
  database: "heroku_a00f886c6a5b036"
});

con.connect(function(err){
  if (err) throw err;
  console.log('Connected');
});

global.con = con;
global.mysql = mysql;

app.use('/', indexRouter);
app.use('/writers', writersRouter);
app.use('/posts', postsRouter);
app.use('/home', homeRouter);
app.use('/profile', profileRouter);

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
  res.render('error');
});

module.exports = app;
