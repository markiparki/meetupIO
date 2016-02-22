'use strict'

//TODO: clean comments!
// facebook daten direkt!
// App Settings: https://developers.facebook.com/apps/151583945205925/
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('./models/user');

module.exports = function(passport) {

    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // FACEBOOK LOGIN
    passport.use(new FacebookStrategy({
        clientID        : process.env.FB_CLIENT_ID,
        clientSecret    : process.env.FB_CLIENT_SECRET,
        callbackURL     : process.env.FB_CALLBACK_URL,
        profileFields: ['id', 'emails', 'name', 'displayName', 'profileUrl', 'gender'] // defines which profile fields we get from facebook
    },
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                if(err) {
                    return done(err);
                }
                // check db for facebook.id, update facebook data and load user
                if (user) {
                    console.log("-- User logged in: " + user.id); 

                    user.email = profile._json.email;
                    user.picture = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200" + "&access_token=" + token;
                    user.name.first = profile._json.first_name;
                    user.name.last = profile._json.last_name;
                    user.gender = profile._json.gender;

                    user.save(function(err) {
                        if (err) {
                            return done(err);
                        }
                        console.log("-- User updated: " + user.id);
                        return done(null, user);
                    }); 
                // no user found with facebook.id, create new user
                } else {

                    var newUser = new User();
                    newUser.facebook.id = profile._json.id;
                    newUser.email = profile._json.email;
                    // TODO: change picture size
                    newUser.picture = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=300&height=300" + "&access_token=" + token;
                    newUser.name.first = profile._json.first_name;
                    newUser.name.last = profile._json.last_name;
                    newUser.username = profile._json.first_name + ' ' + profile._json.last_name.slice(0, 1) + '.'; //TODO: rework!
                    newUser.gender = profile._json.gender;
                    newUser.facebook.link = profile._json.link;

                    newUser.save(function(err) {
                        if (err) {
                            return done(err);
                        }
                        console.log("-- User signed up: " + newUser.id); 
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
};
