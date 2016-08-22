// ROUTING
// Routes Connections
module.exports = function (app, io) {
    // Routes Variables
    var index = require('../routes/index')(io);
    var dashboard = require('../routes/dashboard')(io);

    app.use('/', index);
    app.use('/dashboard', dashboard);

};
