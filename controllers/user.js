'use strict'

var express = require('express');
var router = express.Router();

var User = require('../models/user');

module.exports = function() {

    // checks Authentication for all routes in this controller
    router.all('*', isLoggedIn);

    // /user/home
    router.route('/home')
        .get(function(req, res) {
            res.render('user/home', {
                user : req.user,
                message: req.flash('message')
            });
        });

    // /user/profile
    router.route('/profile')
        .get(function(req, res) {
            res.render('user/profile', {
                user : req.user
            });
            // res.json(req.user);
        });

    // /user/profile/edit
    router.route('/profile/edit')
        .get(function(req, res) {
            res.render('user/edit', {
                user : req.user
            });
        })
        // saving new user data: http://stackoverflow.com/a/24498660/4341770
        .post(function(req, res) {
            var user = req.user;
  
            user.name.first = req.body.first;
            user.name.last = req.body.last;
            user.gender = req.body.gender;

            user.save(function(err) {
                if (err) {
                    return res.error(err);
                } else {
                    req.login(user, function(err) {
                        if (err) {
                            return res.error(err);
                        } else {
                            res.redirect('/user/profile');
                        }
                    })
                }
            })
        });


    //TODO: make better user search!!!
    // /user/id
    router.route('/:id')
        .get(function(req, res) {
            User.findById(req.params.id).exec(function(err, user) {
                if (err) {
                    req.flash('message', 'Invalid ID');
                    res.redirect('/user/home');
                } if (!user) {
                    req.flash('message', 'No user found');
                    res.redirect('/user/home');
                } else {
                    // res.render('user/profile', {user: user});
                    res.json(user);
                }
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