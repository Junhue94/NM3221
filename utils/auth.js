module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            // Continue to 'res.render()'
            return next()
        } else {
            res.render('error_page', {
                layout: 'main',
                message_prod: 'Page Not Found'
            });
        }
    }
};