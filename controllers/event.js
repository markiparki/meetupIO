var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Event = require('../models/event');

module.exports = function() {

	// checks Authentication for all routes in this controller
    router.all('*', isLoggedIn);

    router.route('/')
        .get(function(req, res){
			console.log('debug1');
			Event.find().populate('created_by').exec(function(err, events){
				console.log('debug2');
				if(err){
					return res.send(500, err);
				}
				// return res.send(200,events);
				return res.render('event/index', {events: events});
			});
		});

	router.route('/add')
		.get(function(req, res){
			// return res.send(200,events);
			res.render('event/add', {
            user : req.user,
            message: req.flash('message')
            });
		})
		//creates a new event
		.post(function(req, res){

			var newEvent = new Event();
			newEvent.title = req.body.title;
			newEvent.body = req.body.body;
			newEvent.created_by = req.user._id;
			newEvent.loc = [13.341850, 52.555550]; //TODO: dummy lng lat
			newEvent.save(function(err, newEvent) {
				if (err){
					return res.send(500, err);
				}
				return res.redirect('/event/' + newEvent.id);
			});
		})

	//event-specific commands. likely won't be used
	router.route('/:id')
		//gets specified event
		.get(function(req, res){
			Event.findById(req.params.id, function(err, event){
				if(err)
					res.send(err);
				req.params.id = event.id
				res.json(event);
			});
		}) 
		//updates specified event
		.put(function(req, res){
			Event.findById(req.params.id, function(err, event){
				if(err)
					res.send(err);

				event.author = req.body.author;
				event.text = req.body.text;

				event.save(function(err, event){
					if(err)
						res.send(err);

					res.json(event);
				});
			});
		})
		//deletes the event
		.delete(function(req, res) {
			Event.remove({
				_id: req.params.id
			}, function(err) {
				if (err)
					res.send(err);
				res.json("deleted :(");
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