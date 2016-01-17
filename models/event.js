var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// TODO: Comments in Event -> http://mongoosejs.com/docs/2.7.x/docs/embedded-documents.html
var commentSchema = mongoose.Schema({
    body: String,
    created_by: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: { type: Date, default: Date.now }
})

var eventSchema = mongoose.Schema({

    title: String,
    body: String,
    created_by: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    created_at: { type: Date, default: Date.now },
    comments: [commentSchema]
    //TODO: time, participants, (watchers), comments
});



// create the model for users and expose it to our app
module.exports = mongoose.model('Event', eventSchema);
