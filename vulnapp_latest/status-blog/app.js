var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// open source redis middle layer
// https://github.com/Tonel/nodejs-redis-demo
const {
  initializeRedisClient,
  redisCachingMiddleware,
} = require("./middlewares/redis");

//initializeRedisClient();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Middleware to handle malformed URL requests
app.use(function(req, res, next) {
  // Check if the request URL has a leading slash followed by a port number
  if (req.url.match(/^\/:\d+/)) {
    // Respond with a 401 Bad Request status
    return res.status(401).send('Bad Request: Malformed URL');
  }

  // If the URL is well-formed, proceed to the next middleware
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes with Redis caching middleware
app.use('/', indexRouter); //redisCachingMiddleware(), indexRouter);
app.use('/users', redisCachingMiddleware(), usersRouter);
app.use('//users', redisCachingMiddleware(), usersRouter);
//app.use('/status', usersRouter); //redisCachingMiddleware(), usersRouter);


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
