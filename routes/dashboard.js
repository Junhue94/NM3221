var express = require('express');
var router = express.Router();

var Issue = require('../models/issue_model');

var returnRouter = function (io) {
    router.all('*',
        function (req, res, next) {
            Issue.issue_fn.popMessages(function (err, issue_data) {
                if (err) throw err;
                res.locals.issue_data = issue_data;
                next();
            })
        }
    );

    // Dashboard
    router.get('/', function(req, res, next) {
        res.render('dashboard/dash_main', {
            layout: 'layout_dash',
            title: 'Dashboard',
            page_title: 'Dashboard > Main'
        });
    });


    // Interactions
    router.get('/interactions', function (req, res, next) {
        var issue_data = res.locals.issue_data;
        var unique_dates = [];

        // Obtain Unique Dates
        for (var i = 0; i < issue_data.length; i++) {
            var dataToString = issue_data[i].timestamp.toDateString().toString(),
                dateToList = dataToString.split(" "),
                dateString = dateToList[0] + ', ' + dateToList[2] + ' ' + dateToList[1] + ' '  + dateToList[3],
                dateUrl = dateToList[0] + '-' + dateToList[2] + '-' + dateToList[1] + '-'  + dateToList[3],
                dateDic = {date: dateString, date_url: dateUrl};

                // If list is empty, push directly
            if (unique_dates == false) {
                unique_dates.push(dateDic);
                continue;
            }

            for (var j = 0; j < unique_dates.length; j++) {
                if ((unique_dates[j].date).indexOf(dateDic.date) == -1) {
                    unique_dates.push(dateDic);
                    break;
                }
            }
        }

        res.render('dashboard/dash_ints', {
            layout: 'layout_dash',
            title: 'Dashboard',
            page_title: 'Data > Interactions > Dates',
            unique_dates: unique_dates
        });
    });

    router.get('/interactions/:date', function (req, res, next) {
        var dateString = (req.params.date).replace(/-/g, ' ');

        res.render('dashboard/dash_ints_date', {
            layout: 'layout_dash',
            title: 'Dashboard',
            page_title: 'Data > Interactions > Date > ' + dateString
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
            page_title: 'Data > API',
            issue_data: issue_data_formatted
        });
    });

    return router;
};


module.exports = returnRouter;
