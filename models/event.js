'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = mongoose.Schema({
    body: {
        type: String, 
        required: true
    },
    createdBy: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    }
})

var eventSchema = mongoose.Schema({
    title: {
        type: String, 
        required: true
    },
    body: {
        type: String, 
        required: true
    },
    date: Date, // start date
    createdBy: { 
        type: Schema.ObjectId, 
        ref: 'User', 
        required: true 
    },
    loc: {
        type: [Number],  // [<longitude(lng)>, <latitude(lat)>]
        index: '2dsphere'      // creates the geospatial index
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: Date,
    comments: [commentSchema],
    participants: [{ type: Schema.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Event', eventSchema);
