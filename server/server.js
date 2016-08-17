// SERVER CONNECTION

var app = require('./config');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), function () {
    console.log('Server up: http://localhost:' + app.get('port'));
});