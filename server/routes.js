// ROUTING

// Routes Variables
var index = require('../routes/index');


// Routes Connections
module.exports = function (app) {

    app.use('/', index);

};
