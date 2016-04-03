'use strict'

require('dotenv').load(); //load global variables from .env

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var session = require('express-session');
var routes = require('./controllers')(passport); //pass passport to router
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL); // connect to our database

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing a favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false, // does not create a session until something stored
    resave: false // dooes not save a session if unmodified
}));
app.use(express.static(path.join(__dirname, 'public'))); // shows '/public' as root folder to the user
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
var initPassport = require('./passport'); // pass passport for configuration
initPassport(passport);

// ROUTES
app.use('/', routes); //init router -> 'controllers/index.js'

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
