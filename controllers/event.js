'use strict'

var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Event = require('../models/event');

module.exports = function() {

	// checks Authentication for all routes in this controller
    router.all('*', isLoggedIn);

    router.route('/')
    	// sends all events
        .get(function(req, res, next){
			Event.find().populate('createdBy', 'id username picture').exec(function(err, events){
				if(err) 
					return next(err);
				
				res.json(events);
			});
		})

		// creates a new event
		.post(function(req, res, next){
			var event = new Event();
			event.title = req.body.title;
			event.body = req.body.body;
			event.createdBy = req.user.id;
			// event.date = req.body.date;
			event.date = '2016-01-25T16:54:13.252Z';
			// event.loc = [req.body.lng, req.body.lat];
			event.loc = [23.45345, 56.34532]; //TODO: dummy lng 

			event.save(function(err, event) {
				if (err) 
					return next(err);

				res.json(event);
			});
		});

	router.route('/:id')
		// gets event by event.id
		.get(function(req, res, next){
			Event.findById(req.params.id).populate('createdBy', 'id username picture').exec(function(err, event){
				if(err || !event) 
					return next(err);
				
				res.json(event);
			});
		}) 

		// updates your events by event.id
		.put(function(req, res, next){
			Event.findById(req.params.id, function(err, event){
				if(err) 
					return next(err);

				if(event.createdBy === req.user.id){
				
					event.title = req.body.title;
					event.body = req.body.body;
					// event.date = req.body.date;
					event.date = '2016-01-25T16:54:13.252Z';
					// event.loc = [req.body.lng, req.body.lat];
					event.loc = [23.45345, 56.34532]; //TODO: dummy lng 
					event.updatedAt = Date.now();

					event.save(function(err, event){
						if(err) return next(err);

						res.json(event);
					});
				} else {
					//TODO: send right message to angular
					res.json("not your event! " + event.createdBy + " != " + req.user.id);
				}	
			});
		})

		// deletes your events by event.id
		.delete(function(req, res, next) {
			Event.findById(req.params.id, function(err, event){
				if(err) 
					return next(err);

				if(event.createdBy === req.user.id){
					Event.remove({
						_id: req.params.id
					}, function(err) {
						if (err) 
							return next(err);

						res.json("Event deleted");
					});
				} else {
					//TODO: send right message to angular
					res.json("not your event!");
				}
			});
		});

	router.route('/:id/comment')
		// adds comment to event
		.put(function(req, res, next){
			Event.findById(req.params.id, function(err, event){
				if(err) 
					return next(err);

				event.comments.push({body: req.body.body, createdBy: req.user.id});
				event.save(function(err){
					if(err) 
						return next(err);

					res.json("comment added");
				});
			});
		});

	//TODO: if(already joined) res.json("already joined event")
	router.route('/:id/join')
		//joins user to event
		.get(function(req, res, next){
			Event.findByIdAndUpdate(
		        req.params.id,
		        {$addToSet: {"participants": req.user.id}},
		        {safe: true, new : true},
		        function(err) {
		        	if (err) 
		        		return next(err);

		            res.json("event joined");
		        }
		    );
		});

	router.route('/:id/leave')
		//user leaves event
		.get(function(req, res, next){
			Event.findByIdAndUpdate(
		        req.params.id,
		        {$pull: {"participants": req.user.id}},
		        {safe: true, new : true},
		        function(err) {
		        	if (err) 
		        		return next(err);

		            res.json("event leave");
		        }
		    );
		});

	// MIDDLEWARE ===================================
	//TODO: MAKE BETTER!
    function isLoggedIn(req, res, next){
        if (req.isAuthenticated())
            return next();
        else
        	console.log('-- You must be logged in to do that.');
            req.flash('message', 'You must be logged in to do that.');
            res.redirect('/');
    };
    // ===============================================

    return router;
};