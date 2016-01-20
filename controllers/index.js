'use strict'

var express = require('express');
var router = express.Router();

var User = require('../models/user');

module.exports = function(passport) {
    // organizing routes: http://start.jcolemorrison.com/quick-tip-organizing-routes-in-large-express-4-x-apps/
    //TODO: Review - dont give passport to every router!
    router.use('/auth', require('./auth')(passport));
    router.use('/user', require('./user')(passport));
    router.use('/event', require('./event')(passport));

    // ROUTES
    // index
    router.route('/')
        .get(function (req, res) {
            res.render('index', {message: req.flash('message')});
        });

    return router;
};
