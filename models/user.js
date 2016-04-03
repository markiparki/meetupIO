'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({

    email: String,
    name: {
        first: String,
        last: { 
            type: String, 
            trim: true 
        }        
    },
    username: String,
    gender: String,
    picture: String,
    about: String,
    facebook: {
        id : String,
        link : String
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: Date
});

module.exports = mongoose.model('User', userSchema);
