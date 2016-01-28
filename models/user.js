'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; // for referencing to other object schemas

var userSchema = mongoose.Schema({

    email: String,
    name: {
        first: String,
        last: { 
            type: String, 
            trim: true 
        }        
    },
    username: {
        type: String, 
        required: true 
    },
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
    isActive: { 
        type: Boolean, 
        default: true 
    },
    isAdmin: { 
        type: Boolean, 
        default: false
    }, 
    follows: [{type: Schema.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('User', userSchema);
