var express = require('express');
var router = express.Router();
var async = require('async');
var _ = require('underscore');

var Issue = require('../models/issue_model');
var Message = require('../models/message_model');

var fn_auth = require('../utils/auth');

var nextLevel = '\xa0\xa0\xa0/\xa0\xa0\xa0';

var returnRouter = function (io) {
    router.all('*',
        function (req, res, next) {
            if (req.session && req.session.user) {
                next()
            } else {
                res.render('error_page', {
                    layout: 'main',
                    message_prod: 'Page Not Found'
                });
            }
        },
        // Ensure Authentication
        fn_auth.ensureAuthenticated,
        function (req, res, next) {
            Issue.issue_fn.popMessages(function (err, issue_data) {
                if (err) throw err;
                res.locals.issue_data = issue_data;
                next();
            })
        },
        function (req, res, next) {
            Message.message_fn.getAllMessages(function (err, message_data) {
                if (err) throw err;
                res.locals.message_data = message_data;
                next();
            })
        }
    );

    // Dashboard
    router.get('/', function(req, res, next) {
        res.render('dashboard/dash_main', {
            layout: 'layout_dash',
            title: 'Dashboard',
            page_title: 'Dashboard' + nextLevel + 'Main'
        });
    });


    // Interactions
    router.get('/interactions', function (req, res, next) {
        var issue_data = res.locals.issue_data,
            unique_dates = [],
            unique_dates_list = [];

        // Obtain Unique Dates
        for (var i = 0; i < issue_data.length; i++) {
            var dataToString = issue_data[i].timestamp.toDateString().toString(),
                dateToList = dataToString.split(" "),
                dateString = dateToList[0] + ', ' + dateToList[2] + ' ' + dateToList[1] + ' '  + dateToList[3],
                dateUrl = dateToList[0] + '-' + dateToList[2] + '-' + dateToList[1] + '-'  + dateToList[3],
                dateDic = {date: dateString, date_url: dateUrl};

            // If list is empty, push directly
            if (unique_dates_list == false) {
                unique_dates_list.push(dateString);
                unique_dates.push(dateDic);
            } else {
                if ((unique_dates_list).indexOf(dateString) == -1) {
                    unique_dates_list.push(dateString);
                    unique_dates.push(dateDic);
                }
            }
        }

        res.render('dashboard/dash_ints', {
            layout: 'layout_dash',
            title: 'Dashboard',
            page_title: 'Data' + nextLevel + 'Interactions' + nextLevel + 'Dates',
            unique_dates: unique_dates
        });
    });

    router.get('/interactions/:date', function (req, res, next) {
        var dateParams = (req.params.date).replace(/-/g, ' '),
            issue_data = res.locals.issue_data,
            data_issue = [];

        // Filter Issue for a Particular Date
        for (var i = 0; i < issue_data.length; i++) {
            var dataToString = issue_data[i].timestamp.toDateString().toString(),
                dateToList = dataToString.split(" "),
                dateString = dateToList[0] + ' ' + dateToList[2] + ' ' + dateToList[1] + ' ' + dateToList[3];

            if (dateParams === dateString) {
                data_issue.push(issue_data[i]);
            }
        }

        res.render('dashboard/dash_ints_date', {
            layout: 'layout_dash',
            title: 'Dashboard',
            page_title: 'Data' + nextLevel + 'Interactions' + nextLevel + 'Date' + nextLevel + dateParams,
            data_issue: data_issue,
            dateParams: req.params.date
        });
    });

    router.post('/interactions/:date', function (req, res, next) {
        var body = req.body['checkbox-accepted'],
            issue_data = res.locals.issue_data,
            message_data = res.locals.message_data,
            issue_ids = [],
            message_ids = [],
            rejected_issue_ids = [],
            rejected_message_ids = [];

        if (typeof body === 'string') {
            body = [body]
        }

        // ID of all Issues
        for (var issue_index = 0; issue_index < issue_data.length; issue_index++) {
            issue_ids.push(issue_data[issue_index]._id.toString());
        }

        // ID of all Messages
        for (var msg_index = 0; msg_index < message_data.length; msg_index++) {
            message_ids.push(message_data[msg_index]._id.toString());
        }

        // Categorise 'rejected' Issue and Message IDs
        for (var rejected_id = 0; rejected_id < Object.keys(body).length; rejected_id++) {
            if (issue_ids.indexOf(body[rejected_id]) != -1) {
                rejected_issue_ids.push(body[rejected_id]);
            } else {
                rejected_message_ids.push(body[rejected_id]);
            }
        }

        async.series([
            function (callback) {
                async.each(rejected_message_ids, function (rejected_message_id, callback) {
                    Message.message_fn.updateAccepted(rejected_message_id, 'checked', callback);
                }, function (err) {
                    callback(err);
                });
            },
            function (callback) {
                async.each(rejected_issue_ids, function (rejected_issue_id, callback) {
                    Issue.issue_fn.updateAccepted(rejected_issue_id, 'checked', callback);
                }, function (err) {
                    callback(err);
                });
            }],
            // Callback
            function (err, results) {
                if (err) throw err;
                req.flash('success_msg', 'Data Updated!');
                res.redirect('/dashboard/interactions/' + req.params.date);
            }
        );
    });


    // Results
    router.get('/results', function (req, res, next) {
        var issue_data = res.locals.issue_data,
            message_data = res.locals.message_data;

        var unique_matric = [],
            unique_matric_list = [],
            unique_dates_list = [];

        // Unique Matric No
        // From Issue Model
        for (var issue_matric = 0; issue_matric < issue_data.length; issue_matric++) {
            var each_issue_matric = issue_data[issue_matric].matric_no,
                each_issue_username = issue_data[issue_matric].username;
            if (unique_matric_list.indexOf(each_issue_matric) == -1) {
                unique_matric_list.push(each_issue_matric);
                unique_matric.push({matric_no: each_issue_matric, username: each_issue_username, date:{}, total: 0})
            }
        }
        // From Message Model
        for (var msg_matric = 0; msg_matric < message_data.length; msg_matric++) {
            var each_msg_matric = message_data[msg_matric].matric_no,
                each_msg_username = message_data[msg_matric].username;
            if (unique_matric_list.indexOf(each_msg_matric) == -1) {
                unique_matric_list.push(each_msg_matric);
                unique_matric.push({matric_no: each_msg_matric, username: each_msg_username, date:{}, total: 0});
            }
        }

        // Obtain unique dates
        for (var issue_index = 0; issue_index < issue_data.length; issue_index++) {
            var dataToString = issue_data[issue_index].timestamp.toDateString().toString(),
                dateToList = dataToString.split(" "),
                dateString = dateToList[2] + '-' + dateToList[1];

            if (unique_dates_list.indexOf(dateString) == -1) {
                unique_dates_list.push(dateString);
            }
        }

        // Append each unique date to every Matric No
        for (var each_date = 0; each_date < unique_dates_list.length; each_date++) {
            for (var each_matric = 0; each_matric < unique_matric.length; each_matric++) {
                unique_matric[each_matric].date[unique_dates_list[each_date]] = 0;
            }
        }

        // Score for Issue
        for (var issue_index_1 = 0; issue_index_1 < issue_data.length; issue_index_1++) {
            var dataToString_1 = issue_data[issue_index_1].timestamp.toDateString().toString(),
                dateToList_1 = dataToString_1.split(" "),
                dateString_1= dateToList_1[2] + '-' + dateToList_1[1],
                matric_no = issue_data[issue_index_1].matric_no,
                matric_no_index = unique_matric_list.indexOf(matric_no),
                matric_date = unique_matric[matric_no_index].date;

            if (issue_data[issue_index_1].accepted == false) {
                var issue_score_filter = _.filter(issue_data[issue_index_1].message, function (message) {
                    return message.accepted == false;
                });
                var issue_score = issue_score_filter.length;
                // Score added to issue Creator
                matric_date[dateString_1] += issue_score;

                // Score added for Message Creator for this Issue
                for (var msg_index = 0; msg_index < issue_score_filter.length; msg_index++) {
                    var matric_no_pos = unique_matric_list.indexOf(issue_score_filter[msg_index].matric_no);
                    unique_matric[matric_no_pos].date[dateString_1] += (issue_score - msg_index);
                }
             }
        }

        // Total Score for each student
        for (var each_score = 0; each_score < unique_matric.length; each_score++) {
            var total_score = unique_matric[each_score].date,
                total = 0,
                all_values = _.values(total_score);

            for (var score_date = 0; score_date < all_values.length; score_date++) {
                total += all_values[score_date];
            }

            unique_matric[each_score].total = total;
        }

        res.render('dashboard/dash_results', {
            layout: 'layout_dash',
            title: 'Dashboard',
            page_title: 'Data' + nextLevel + 'Results',
            date_list: unique_dates_list,
            student: unique_matric
        });
    });

    
    // API
    router.get('/api', function (req, res, next) {
        var issue_data_formatted = [];

        for (var i = 0; i < res.locals.issue_data.length; i++) {
            issue_data_formatted += (res.locals.issue_data)[i] + ',\n\n';
        }

        res.render('dashboard/dash_api', {
            layout: 'layout_dash',
            title: 'Dashboard',
            page_title: 'Data' + nextLevel + 'API',
            issue_data: issue_data_formatted
        });
    });

    return router;
};


module.exports = returnRouter;
