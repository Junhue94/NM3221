var express = require('express');
var router = express.Router();


var returnRouter = function (io) {
    router.get('/', function (req, res) {
        // Destroy session
        req.session.destroy(function (err) {
            if (err) throw err;
        });
        req.logout();
        res.redirect('/login');
    });

    return router;
};


module.exports = returnRouter;
