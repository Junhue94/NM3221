// CONFIGURATIONS

var express = require('express');
var exphbs = require('express-handlebars');
var session = require('express-session');
var flash = require('connect-flash');
var path = require('path');
var morgan = require('morgan');  // For HTTP request logging
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');  // Handle only JSON and URL-encoded submission
var mongoose = require('mongoose');
var routes = require('./routes');

var app = express();

// Set Environment
app.set('env', 'development');

// Database Connection
// Setup connection to database
mongoose.Promise = global.Promise;
if (app.get('env') === 'development') {
    mongoose.connect('mongodb://localhost/nm3221');
} else {
    mongoose.connect('mongodb://jycircles:zx55878@ds161175.mlab.com:61175/nm3221');
}

// Test Database Connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database Connection Error:'));
db.once('open', function() {
    console.log('Database Connection Successful')
});


// Path Settings
app.set('views', path.join(__dirname, '..', 'views'));


// Template / View Engine Setup
var main = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    // Define views directory
    layoutsDir: path.join(app.get('views'), 'layouts'),
    // Define partials directory
    partialsDir: [path.join(app.get('views'), 'partials')]
});

app.engine('hbs', main.engine);
app.set('view engine', 'hbs');


// Middleware
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon', 'logo.jpg')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use('/node_modules',  express.static(path.join(__dirname, '..', 'node_modules')));

// Logger
// If morgan is after static files, statics files won't be logged
app.use(morgan('dev'));

// Express Session
// Use cookies to keep track users. Thus, must be use after cookieParser
app.use(session({
    secret: 'theseedoffuture', // used to sign the session ID cookie
    saveUninitialized: true, // forces a session that is "uninitialized" to be saved to the store
    resave: true // forces the session to be saved back to the session store, even if the session was never modified during the request
}));

app.use(flash());


// Global Vars
// This middleware will be executed for every request to the app
// Middleware mounted without a path will be executed for every request to the app
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    // Put user into res.locals for easy access from templates
    res.locals.user = req.user || null;
    next();
});


// Run Routes
routes(app);

// Any GET request not already handled, use this route
// Error Handling
// Catch 404 and forward to Error Handler
app.use(function(req, res, next) {
    var err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Development Error Handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);  // Sets the HTTP status for the response
        res.render('error_page', {
            message: err.message,
            error: err,
            layout: 'main'
        });
    });
}

// Production Error Handler
// No stack traces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error_page', {
        message: err.message,
        layout: 'main'
    });
});


// Export Module
// Variable 'app' is the entire express() application
// This mod made various changes to the application (eg. app.use(), app.set(), etc) before exporting
// The final result that is exported is the application with the changes in this mod
module.exports = app;
