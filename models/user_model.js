var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
});

// Compile schema into a model and export model
var User = module.exports = mongoose.model('User', UserSchema, 'user');


// Usable functions
module.exports.user_fn = {
    createUser: function (newUser, callback) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                newUser.password = hash;
                // Save to both collections simultaneously
                newUser.save(callback);
            });
        })
    },

    getUserByUsername: function (username, callback) {
        var query = {username: username};
        User.findOne(query, callback);
    },

    getUserById: function (id, callback) {
        User.findById(id, callback);
    },

    comparePassword: function (password, hash, callback) {
        // 'isMatch' will return 'true' or 'false'
        bcrypt.compare(password, hash, function (err, isMatch) {
            if (err) throw err;
            callback(null, isMatch);
        });
    }
};
