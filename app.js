var express = require('express');
var eSession = require('express-session');
var mongoStore = require('connect-mongo')(eSession);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./server-controller/route');
var Users = require('./models/users');

var app = express();


// Mongodb configuration
mongoose.connect('mongodb://localhost/users', function(err) {
	if(err) return console.log('Could not connect to MongoDB!');
	console.log('Connected to mongodb');
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(eSession({
	secret: 'meow',
	resave: false,
	cookie: { maxAge: 604800000 },
	saveUninitialized: false,
	store: new mongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');


// Passport config
passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

// Routes
app.use('/', routes);

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = {
	app: app, 
	mongoStore: mongoStore
}
