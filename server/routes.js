// ROUTING
// Routes Connections
module.exports = function (app, io) {
    // Routes Variables
    var index = require('../routes/index')(io);
    var login = require('../routes/login')(io);
    var logout = require('../routes/logout')(io);
    var dashboard = require('../routes/dashboard')(io);

    app.use('/', index);
    app.use('/login', login);
    app.use('/logout', logout);
    app.use('/dashboard', dashboard);

};
