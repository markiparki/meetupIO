'use strict'

var express = require('express');
var router = express.Router();

module.exports = function(passport){

/**
	//sends successful login state back to angular
	router.get('/success', function(req, res){
		res.send({state: 'success', user: req.user ? req.user : null});
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
		res.send({state: 'failure', user: null, message: "Invalid username or password"});
	});

	//log in
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure'
	}));

	//sign up
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure'
	}));

	//log out
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

**/
  
  
    // facebook login
    // send to facebook to do the authentication
    router.route('/facebook')
        .get(passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    router.route('/facebook/callback')
        .get(
            passport.authenticate('facebook', {
                successRedirect : '/user/home',
                failureRedirect : '/login'
        }));

    // /logout
    router.route('/logout')
        .get(function(req, res) {
            req.logout();
            res.redirect('/');
        });

	return router;

}