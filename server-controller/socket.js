var app = require('../app').app;
var mongoStore = require('../app').mongoStore;
var http = require('http').Server(app);
var sio = require('socket.io')(http);
var connect = require('connect');
var cookieParser = require('cookie-parser');
var Sessions = require('../models/sess');
var Users = require('../models/users');


sio.use(function(socket, next) {
	var sid = connect.utils.parseCookie(socket.handshake.headers.cookie);
	var pureSid = cookieParser.signedCookie(sid['connect.sid'], 'meow');

		Sessions.findById(pureSid, function(err, data) {
			socket.handshake.userSess = data.session;
			var sidToJSON = socket.handshake.userSess.toJSON();
			var pJSON = JSON.parse(sidToJSON);
			socket.handshake.user = pJSON.passport.user;

			Users.findOne({ username: socket.handshake.user}, function(err, data) {
				if(!data) {
					return;
				} else {
					socket.handshake.avatar = data.avatar;
					return next();
				}
			});
		});
});

sio.on('connection', function(socket) {
	var username = socket.handshake.user;
	var avatar = socket.handshake.avatar;

	console.log('User connected: ' + username);

	socket.on('Msg', function(msg) {
		var dateNow = new Date();
		var hour = (dateNow.getHours()<10?'0':'') + dateNow.getHours();
		var min = (dateNow.getMinutes()<10?'0':'') + dateNow.getMinutes();
		var sec = (dateNow.getSeconds()<10?'0':'') + dateNow.getSeconds();
		var date = hour + ":" + min + ":" + sec;

		sio.emit('Msg', username, avatar, date, msg);
	});

	socket.on('disconnect', function(){
		console.log('User disconnected: ' + socket.handshake.user);
	});
});


module.exports = sio;