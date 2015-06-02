'use strict';

var express = require('express');
var passport = require('passport');
var multer = require('multer');
var Users = require('../models/users');
var Article = require('../models/articles');
var gm = require('gm');
var router = express.Router();
var app = express();


router.get('/', function(req, res) {
	res.render('index', { user : req.user });
});

router.get('/chat', function(req, res) {
	if(!req.user) {
		res.redirect('/');
	} else {
		res.render('chat', { user: req.user.username });
	}
});

router.get('/part/:filename', function(req, res) {
	var filename = req.params.filename;
	if(!filename) return;
	res.render('part/' + filename, { 
		user : req.user
	});
});

router.get('/create', function(req, res) {
	if(!req.user) {
		res.redirect('/');
	} else {
		res.render('create', {});
	}
});

router.post('/create', 
	multer({ dest: './public/images/uploads/', 
		onFileUploadComplete: function(file) {
			var imagePath = file.path;

			gm(imagePath)
				.resize(1000,720)
				.quality(90)
				.write('public/images/uploads/article_img/' + file.name, function(err) {
					if(err) console.log('Error: ' + err);
				});
		}
	}), 
	function(req, res) {
		var defaultUserPlaceholder = 'article-placeholder.png';
		var dateNow = new Date();
		var day = dateNow.getDate();
		var year = dateNow.getFullYear();
		var hour = dateNow.getHours();
		var minute = (dateNow.getMinutes()<10?'0':'') + dateNow.getMinutes();
		
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var date = day + ' ' + monthNames[dateNow.getMonth()] + ' ' + year + ' / ' + hour + ':' + minute;

		if(!req.files.thumb) {
			var article = new Article({ header: req.body.header, text: req.body.text, author: req.user.username, publishDate: date, image: defaultUserPlaceholder });

			article.save(function(err, article) {
				if(err) console.log('Create error!');
				res.redirect('/');
			});
		} else {
			var article = new Article({ header: req.body.header, text: req.body.text, author: req.user.username, publishDate: date, image: req.files.thumb.name });

			article.save(function(err, article) {
				if(err) console.log('Create error!');
				res.redirect('/');
			});
		}
});

router.get('/admin', function(req, res) {
	if(!req.user || !req.user.isAdmin) {
		res.redirect('/');
	} else {
		res.render('admin', {});
	}
});

router.get('/member_list', function(req, res) {
	Users.find({}, function(err, data) {
		if(err) console.error;
		var users = [];
		data.forEach(function(item, i, arr) {
			users[i] = {
				_id: data[i]._id,
				username: data[i].username
			};
		});
		res.json(users);
	});
});

router.get('/admin_userlist', function(req, res) {
	if(!req.user || !req.user.isAdmin) {
		res.redirect('/');
	} else {
		Users.find({}, function(err, data) {
			if(err) console.error;
			res.json(data);
		});
	}
});

router.get('/article', function(req, res) {
	Article.find({}, function(err, data) {
		if(err) console.error;

		res.json(data);
	});
});

router.get('/article/:id', function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		if(err) console.error;
		res.json(data);
	})
});

router.delete('/article/:id', function(req, res) {
	Article.findByIdAndRemove(req.params.id, function(err, data) {
		if(err) console.error;
	});
});

router.put('/admin_userlist/:id', function(req, res) {
	Users.findById(req.params.id, function(err, data) {
		if(err) console.error;
		if(data.isAdmin == false) {
			Users.findByIdAndUpdate(req.params.id, { $set: { isAdmin: true } }, function(err) {
				if(err) console.error;
			});
		} else {
			Users.findByIdAndUpdate(req.params.id, { $set: { isAdmin: false } }, function(err) {
				if(err) console.error;
			});
		}
	});
});

router.post('/user/avatar/:id', 
	multer({ dest: './public/images/useravatar', 
		onFileUploadComplete: function(file) {
			var imagePath = file.path;

			gm(imagePath)
				.resize(350,350)
				.write('public/images/useravatar/350x350/' + file.name, function(err) {
					if(err) console.log('Error: ' + err);
				});
		}
	}), 
	function(req, res) {
		Users.findByIdAndUpdate(req.params.id, { $set: { avatar: req.files.avatar.name } }, function(err) {
			if (err) console.error;
			res.redirect('/');
		});
});

router.delete('/admin_userlist/:id', function(req, res) {
	Users.findByIdAndRemove(req.params.id, function(err) {
		if(err) console.error;
	});
});

router.get('/login', function(req, res) {
	if(!req.user || !req.user.isAdmin) {
		res.render('part/login',{});
	} else {
		res.redirect('/');
	}
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

router.post('/register', 
	multer({ dest: './public/images/useravatar/', 
		onFileUploadComplete: function(file) {
			var imagePath = file.path;

			gm(imagePath)
				.resize(350,350)
				.write('public/images/useravatar/350x350/' + file.name, function(err) {
					if(err) console.log('Error: ' + err);
				});
		}
	}), 
	function(req, res) {
	if (!req.files.avatar) {
		var defaultUserPlaceholder = 'user-placeholder.png';
		Users.register(new Users({ username: req.body.username, email: req.body.email, avatar: defaultUserPlaceholder }), req.body.password, function(err, user) {
			if (err) console.error;

			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	} else {
		Users.register(new Users({ username: req.body.username, email: req.body.email, avatar: req.files.avatar.name }), req.body.password, function(err, user) {
			if (err) console.error;

			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	}
});

router.get('/*', function(req, res) {
	res.redirect('/');
});


module.exports = router;