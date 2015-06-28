var app = require('../app').app;
var mongoStore = require('../app').mongoStore;
var http = require('http').Server(app);
var sio = require('socket.io')(http);
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var Sessions = require('../models/sess');
var Users = require('../models/users');
var OnlineUser = require('../models/online-users');
var ChatHistory = require('../models/chat-history');


OnlineUser.remove({}, function(err) {
	if(err) {
		console.log(err);
	}
});

sio.use(function(socket, next) {

	var sid = cookie.parse(socket.handshake.headers.cookie);

	if(!sid['connect.sid']) {
		console.log('Session id not found');
	} else {
		var pureSid = cookieParser.signedCookie(sid['connect.sid'], 'meow');

		Sessions.findById(pureSid, function(err, data) {
			if(err) {
				console.log(err);
			}

			socket.handshake.userSess = data.session

			if(!socket.handshake.userSess) {
				console.log('Session not found');
			} else {
				var sidToJSON = socket.handshake.userSess.toJSON();
				var pJSON = JSON.parse(sidToJSON);
				socket.handshake.user = pJSON.passport.user;
			}

			Users.findOne({ username: socket.handshake.user }, function(err, data) {
				if(err) {
					console.log(err);
				}
				if(!data) {
					console.log('User not found');
				} else {
					socket.handshake.avatar = data.avatar;
					return next();
				}
			});
		});
	}
});

sio.on('connection', function(socket) {

	var username = socket.handshake.user;
	var avatar = socket.handshake.avatar;

	console.log('User connected: ' + username);

	var user = new OnlineUser({ username: username });
	user.save(function(err) {
		if(err) {
			console.log(err);
		}
		OnlineUser.find({}, function(err, users) {
			sio.emit('OnlineList', users);
		});
	});

	ChatHistory.find({}, function(err, data) {

		var dateNow = new Date();
		var day = dateNow.getDay();
		var notExpiredMsg = [];

		data.forEach(function(item, i, arr) {
			if(data[i].day != day) {
				ChatHistory.findByIdAndRemove(data[i]._id, function(err) {
					if(err) console.log(err);
				});
			} else {
				notExpiredMsg.push(data[i]);
			}
		});
		sio.emit('MsgHistory', notExpiredMsg);
	});

	socket.on('Msg', function(msg) {

		var dateNow = new Date();
		var hour = (dateNow.getHours()<10?'0':'') + dateNow.getHours();
		var min = (dateNow.getMinutes()<10?'0':'') + dateNow.getMinutes();
		var sec = (dateNow.getSeconds()<10?'0':'') + dateNow.getSeconds();
		var day = dateNow.getDay();
		var date = hour + ":" + min + ":" + sec;

		sio.emit('Msg', username, avatar, date, msg);

		Users.findOne({ username: username }, function(err, data) {
			var msgToDB = new ChatHistory({ author: username, message: msg, msgTime: date, day: day, authorAvatar: data.avatar });
			msgToDB.save(function(err) {
				if (err) console.log(err);
			})
		});

	});

	socket.on('disconnect', function(){
		console.log('User disconnected: ' + username);

		OnlineUser.findOne({ username: username }, function(err, user) {
			if(err) {
				console.log(err);
			}
			user.remove();

			OnlineUser.find({}, function(err, users) {
				sio.emit('OnlineList', users);
			});
		});

	});
});


module.exports = sio;