// copied from scotch.io

// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({

    email: String,
    name: {
        username: { type: String},
        full: String,
        first: String,
        last: { type: String, trim: true },        
    },
    gender: { type: String, enum: ['male', 'female', 'undefined'] }, //TODO: read about enums!
    picture: { type: String },
    facebook: {
        id : String,
        link : String
    },
    created: { type: Date, default: Date.now }, //TODO: rename!
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false}

});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
