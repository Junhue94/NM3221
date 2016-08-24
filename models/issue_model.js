var mongoose = require('mongoose');

// Lesson Schema
var IssueSchema = mongoose.Schema({
    username: {
        type: String
    },
    matric_no: {
        type: String
    },
    issue: {
        type: String
    },
    message: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    accepted: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date
    },
    created: {
        type: String
    }
});


// Compile schema into a model and export model
var Issue = module.exports = mongoose.model('Issue', IssueSchema, 'issues');


// Usable functions
module.exports.issue_fn = {
    createIssue: function (newIssue, callback) {
        newIssue.save(callback);
    },

    getAllIssues: function (callback) {
        Issue.find(callback);
    },

    popMessages: function (callback) {
        //'populate' to extract the data based on the 'co_url'
        Issue.find({})
            .populate('message')
            .exec(callback);
    },

    updateMessage: function (issue_id, message_id, callback) {
        Issue.update(
            {_id: issue_id},
            {$push: {message: message_id}},
            callback
        )
    },

    updateAccepted: function (issue_id, accepted_value, callback) {
        var query = {_id: issue_id};
        var update = {$set: {accepted: accepted_value}};
        Issue.update(query, update, callback);
    }
};
