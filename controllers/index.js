'use strict'

var express = require('express');
var router = express.Router();

var User = require('../models/user');

module.exports = function(passport) {
    // organizing routes: http://start.jcolemorrison.com/quick-tip-organizing-routes-in-large-express-4-x-apps/
    //TODO: Review - dont give passport to every router!
    router.use('/auth', require('./auth')(passport));
    router.use('/api/user', require('./user')(passport));
    router.use('/api/event', require('./event')(passport));

    router.route('/')
        // renders index.ejs as a starting point
        .get(function (req, res, next) {
        if(!req.user){
            res.render('index', {
                 title: "meetupIO"
             });
        }else{
            res.render('home', { 
                title: "meetupIO authenticated",
                user: req.user 
                });
            }
        });

    return router;
};
