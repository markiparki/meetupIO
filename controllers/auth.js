'use strict'

var express = require('express');
var router = express.Router();

module.exports = function(passport) {

	//sends successful login state back to angular
	router.get('/success', function(req, res) {
        res.redirect('/');
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res) {
		res.send({state: 'failure', user: null, message: "Facebook authorization failed. Please try again."});
	});
  
  
    // facebook login
    // send to facebook to do the authentication
    router.route('/facebook')
        .get(passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    router.route('/facebook/callback')
        .get(
            passport.authenticate('facebook', {
            	successRedirect: '/auth/success',
				failureRedirect: '/auth/failure'
        }));

    // /logout
    router.route('/logout')
        .get(function(req, res) {
            req.logout();
            res.redirect('/');
        });

	return router;
}