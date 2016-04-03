'use strict'

var express = require('express');
var router = express.Router();

var User = require('../models/user');

module.exports = function(passport) {
    // include other controller here
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
            // renders home.ejs after login
            res.render('home', { 
                title: "meetupIO authenticated",
                mapsApiKey: process.env.MAPS_API_KEY
                });
            }
        });

    return router;
};
