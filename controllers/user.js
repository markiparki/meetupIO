'use strict'

var express = require('express');
var router = express.Router();

var User = require('../models/user');

module.exports = function() {

    // checks Authentication for all routes in this controller
    router.all('*', isLoggedIn);

    router.route('/profile')
        // gets users profile
        .get(function(req, res) {
            res.json(req.user);
        })

        //updates user profile and returns user's data
        .put(function(req, res, next) {
            var user = req.user;

            user.username = req.body.username;
            user.about = req.body.about;

            user.save(function(err, user) {
                if(err)
                    return next(err);

                res.json(user);
            });
        });


    //TODO: make better user search!!!
    router.route('/:id')
        // gets user by id
        .get(function(req, res, next) {
            User.findById(req.params.id).select('id username about gender picture friends').exec(function(err, user) {

                if (err || !user)
                    return next(err);
                
                return res.json(user);
            });
        });

    // MIDDLEWARE ===================================
    //TODO: MAKE BETTER!
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        else
            console.log('-- You must be logged in to do that.');
            req.flash('message', 'You must be logged in to do that.');
            res.redirect('/');
    }
    // ===============================================
    return router;
};