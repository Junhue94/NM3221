var express = require('express');
var router = express.Router();
var async = require('async');

var Message = require('../models/message_model');
var Issue = require('../models/issue_model');

var users = [];
var all_matric_no = [];

var returnRouter = function (io) {
    router.get('/', function(req, res, next) {
        res.render('index', {
            title: 'NM3221 Interaction',
            users: all_matric_no
        });
    });

    io.sockets.on('connection', function (socket) {
        // Load all Messages
        Issue.issue_fn.popMessages(function (err, allMessages) {
            if (err) {
                throw err;
            } else {
                socket.emit('load-old-messages', allMessages)
            }
        });

        // Load all Issues
        Issue.issue_fn.getAllIssues(function (err, allIssues) {
            if (err) {
                throw err;
            } else {
                socket.emit('load-all-issues', allIssues)
            }
        });

        function updateUsersList() {
            var no_of_users = all_matric_no.length;
            io.sockets.emit('updated-user-list', {users: users, no_of_users: no_of_users});
        }
        
        socket.on('user-login', function (data, callback) {
            // Check if username already exists
            if (all_matric_no.indexOf(data.userMatricNo) != -1) {
                callback(false);
            } else {
                callback(true);
                // Store 'username' in each user's socket
                socket.user_name = data.userName;
                socket.user_matric_no = data.userMatricNo;
                users.push({user_name: socket.user_name, user_matric_no: socket.user_matric_no});
                all_matric_no.push(socket.user_matric_no);
                updateUsersList();
            }
        });

        socket.on('submit-new-issue', function (newIssueTitle) {
            var date = new Date();
            var newIssue = new Issue({
                username: socket.user_name,
                matric_no: socket.user_matric_no,
                issue: newIssueTitle,
                timestamp: date,
                created: date.getTime()
            });

            Issue.issue_fn.createIssue(newIssue, function (err) {
                if (err) {
                    throw err;
                } else {
                    io.emit('create-new-issue', newIssue);
                }
            })
        });

        socket.on('send-message', function (data) {
            var date = new Date();
            var newMessage = new Message({
                username: socket.user_name,
                matric_no: socket.user_matric_no,
                message: data.messageInput,
                timestamp: date,
                created: date.getTime()
            });

            async.series([
                function (callback) {
                    Message.message_fn.createMessage(newMessage, function (err) {
                        callback(err);
                    })
                },
                function (callback) {
                    Issue.issue_fn.updateMessage(data.issue_id ,newMessage._id, function (err) {
                        callback(err);
                    })
                }],
                // Callback
                function (err, results) {
                    if (err) throw err;
                    io.emit('new-message', {
                        issue_id: data.issue_id,
                        newMessage: newMessage
                    });
                }
            );
        });

        socket.on('disconnect', function () {
            // If user's socket has 'user' attribute, it means that it had logged in previously
            if (socket.user_matric_no) {
                // Retrieve index of user from list and remove it
                users.splice(users.indexOf({user_name: socket.user_name, user_matric_no: socket.user_matric_no}), 1);
                all_matric_no.splice(all_matric_no.indexOf(socket.user_matric_no), 1);
                updateUsersList();
            }
        });
    });

    return router;
};

module.exports = returnRouter;
