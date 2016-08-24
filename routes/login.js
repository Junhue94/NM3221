var express = require('express');
var router = express.Router();

var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user_model');

var returnRouter = function (io) {
    // Login - POST
    // Authentication - Passport Local Strategy
    passport.use(new LocalStrategy({
            // Set the auth field ('name' in form's input tag)
            usernameField: 'user-name',
            passwordField: 'user-password'
        },
        // 'username' and 'password' are as defined above
        function(username, password, done) {
            // Second parameter is a callback functions
            // The first argument is an error object
            // The second argument is reserved for any successful response data returned by functions
            // 'user' will return the entire data of the user in dict format
            User.user_fn.getUserByUsername(username, function (err, user) {
                if (err) throw err;
                if (!user) {
                    // 'done(null, false)' is to return a authentication failure
                    return done(null, false, {message: 'Invalid Email or Password'})
                }

                // If username exists
                // Take in two password and run third parameter
                User.user_fn.comparePassword(password, user.password, function (err, isMatch) {
                    if (err) throw err;
                    if (isMatch) {
                        // done(null, usr) means that authentication completed
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Invalid Email or Password'})
                    }
                });
            });
        }
    ));

    // Sessions & Cookies Management
    // Serialize functions determine what data from the user object should be stored in the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // First argument is the key (id in this case) provided in Serialize functions to retrieve the project
    // When matched, the fetched object is attached to request object as 'req.user'
    passport.deserializeUser(function(id, done) {
        User.user_fn.getUserById(id, function(err, user) {
            done(err, user);
        });
    });

    router.get('/', function (req, res, next) {
        if (req.session && req.session.user) {
            res.redirect('/dashboard');
        } else {
            res.render('login/login', {
                layout: 'main',
                title: 'User Login'
            });
        }
    });

    router.post('/',
        passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}),
        function (req, res, next) {
            // Set cookie expiry
            var hour = 24 * 60 * 60 * 1000; // 1 day
            // Time when cookie expires
            req.session.cookie.expires = new Date(Date.now() + hour);
            // Time remaining for cookie to expire
            req.session.cookie.maxAge = hour;
            req.session.user = true;
            res.redirect('/dashboard');
        }
    );

    // User Registration
    router.get('/register', function (req, res, next) {
        res.render('login/register', {
            layout: 'main',
            title: 'User Registration'
        });
    });

    router.post('/register', function (req, res, next) {
        var username = req.body['username'],
            password = req.body['password'];

        var newUser = new User({
            username: username,
            password: password
        });

        User.user_fn.createUser(newUser, function (err) {
            if (err) throw err;
            req.flash('success_msg', 'User Created!');
            res.redirect('/login/register');
        });
    });

    return router;
};


module.exports = returnRouter;
