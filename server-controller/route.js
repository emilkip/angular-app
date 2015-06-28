'use strict';

var express = require('express');
var async = require('async');
var passport = require('passport');
var multer = require('multer');
var Users = require('../models/users');
var Article = require('../models/articles');
var Mailbox = require('../models/mailbox');
var bb = require('epochtalk-bbcode-parser');
var fs = require('fs');
var gm = require('gm');
var router = express.Router();
var app = express();


var dateNow = function() {
	var dateNow = new Date();
	var day = dateNow.getDate();
	var year = dateNow.getFullYear();
	var hour = dateNow.getHours();
	var minute = (dateNow.getMinutes()<10?'0':'') + dateNow.getMinutes();
	
	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var date = day + ' ' + monthNames[dateNow.getMonth()] + ' ' + year + ' / ' + hour + ':' + minute;

	return date;
}

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

// For angularjs (ng-view)
router.get('/part/:filename', function(req, res) {
	var filename = req.params.filename;
	if(!filename) return;

	res.render('part/' + filename, { 
		user : req.user,
	});
});

router.get('/profile/:user', function(req, res) {
	if(req.params.user != req.user.username) {
		res.send(false);
	} else {
		res.send(true);
	}
});

router.post('/message', function(req, res) {
	var message = new Mailbox({ from: req.body.from, to: req.body.to, topic: req.body.topic, text: req.body.text, date: dateNow() });
	message.save();

	res.json({ status: 'ok'});
});

router.post('/check_mailbox', function(req, res) {
	Mailbox.find({ to: req.user.username, wasRead: false }, function(err, messages) {
		if(err) console.log(err);

		var msgCount = messages.length;
		res.json({ msgCount: msgCount });
	});
});

router.get('/last_message', function(req, res) {
	var withAvatar = [];

	Mailbox.find({ to: req.user.username, wasRead: false }, function(err, messages) {
		if(err) console.log(err);

		function custom_sort(a,b) {
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		}
		messages.sort(custom_sort);
		messages.reverse();

		var sortedMsg = messages.slice(0,4);

		res.json(sortedMsg);
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
					fs.unlink('public/images/uploads/' + file.name);
				});
		}
	}), 
	function(req, res) {

		if(!req.files.thumb) {
			var article = new Article({ header: req.body.header, text: req.body.text, author: req.user.username, authorAvatar: req.user.avatar, publishDate: dateNow(), image: defaultUserPlaceholder });

			article.save(function(err) {
				if(err) console.log('Create error!');
				res.redirect('/');
			});
		} else {
			var article = new Article({ header: req.body.header, text: req.body.text, author: req.user.username, authorAvatar: req.user.avatar, publishDate: dateNow(), image: req.files.thumb.name });

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

router.put('/admin_userlist/:id', function(req, res) {
	Users.findById(req.params.id, function(err, data) {
		if(err) console.error;
		if(data.isAdmin == false) {
			Users.findByIdAndUpdate(req.params.id, { $set: { isAdmin: true } }, function(err) {
				if(err) console.error;

				res.sendStatus(200);
			});
		} else {
			Users.findByIdAndUpdate(req.params.id, { $set: { isAdmin: false } }, function(err) {
				if(err) console.error;

				res.sendStatus(200);
			});
		}
	});
});

router.delete('/admin_userlist/:id', function(req, res) {
	Users.findByIdAndRemove(req.params.id, function(err) {
		if(err) console.error;

		res.sendStatus(200);
	});
});

router.get('/member_list', function(req, res) {
	Users.find({}, function(err, data) {
		if(err) console.error;
		var users = [];
		data.forEach(function(item, i, arr) {
			users[i] = {
				_id: data[i]._id,
				username: data[i].username,
				email: data[i].email,
				avatar: data[i].avatar
			};
		});
		res.json(users);
	});
});

router.get('/member_list/:username', function(req, res) {
	Users.findOne({ username: req.params.username }, function(err, data) {
		if(err) console.error;

		if(data) {
			var user = {};

			user = {
				_id: data._id,
				username: data.username,
				avatar: data.avatar
			};

			res.json(user);
		}
	});
});

router.get('/articles', function(req, res) {

	Article.find({}, function(err, article) {
		if(err) console.error;

		var articles = [];

		article.forEach(function(item, i, arr) {

			var noXssText = article[i].text.replace(/<\/?[^>]+>/g,' ');
			var noXssHeader = article[i].header.replace(/<\/?[^>]+>/g,' ');
			var toHtml = bb.process(noXssText);

			articles[i] = {
				_id: article[i]._id,
				header: noXssHeader,
				text: toHtml.html,
				author: article[i].author,
				authorAvatar: article[i].authorAvatar,
				publishDate: article[i].publishDate,
				image: article[i].image
			}

			function custom_sort(a,b) {
				return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
			}
			articles.sort(custom_sort);
			articles.reverse();
		});

		var articleOnePage = articles.slice(0, 5);

		res.json({
			article: articleOnePage
		});
	});
});


router.get('/articles/:page', function(req, res) {

	Article.find({}, function(err, article) {
		if(err) console.error;

		var page = req.params.page;
		var start = (page - 1) * 5;
		var end = page * 5;
		var articles = [];

		article.forEach(function(item, i, arr) {

			var noXssText = article[i].text.replace(/<\/?[^>]+>/g,' ');
			var noXssHeader = article[i].header.replace(/<\/?[^>]+>/g,' ');
			var toHtml = bb.process(noXssText);

			articles[i] = {
				_id: article[i]._id,
				header: noXssHeader,
				text: toHtml.html,
				author: article[i].author,
				authorAvatar: article[i].authorAvatar,
				publishDate: article[i].publishDate,
				image: article[i].image
			}

			function custom_sort(a,b) {
				return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
			}
			articles.sort(custom_sort);
			articles.reverse();
		});

		var articleOnePage = articles.slice(start, end);

		res.json({
			article: articleOnePage,
			page: req.params.page || 1
		});
	});
});

router.get('/articles/:author/:page', function(req, res) {

	Article.find({ author: req.params.author }, function(err, data) {
		if(err) console.error;

		var page = req.params.page;
		var start = (page - 1) * 5;
		var end = page * 5;
		var articles = [];

		data.forEach(function(item, i, arr) {

			var noXssHeader = data[i].header.replace(/<\/?[^>]+>/g,' ');

			articles[i] = {
				_id: data[i]._id,
				header: noXssHeader,
				publishDate: data[i].publishDate
			}

			function custom_sort(a,b) {
				return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
			}
			articles.sort(custom_sort);
			articles.reverse();
		});

		var articleOnePage = articles.slice(start, end);

		res.json({
			articles: articleOnePage,
			page: req.params.page || 1
		});
	});
});

router.get('/last_articles', function(req, res) {

	Article.find({}, function(err, article) {
		if(err) console.error;

		var articles = [];
		article.forEach(function(item, i, arr) {

			var noXssText = article[i].text.replace(/<\/?[^>]+>/g,' ');
			var noXssHeader = article[i].header.replace(/<\/?[^>]+>/g,' ');
			var toHtml = bb.process(noXssText);

			articles[i] = {
				_id: article[i]._id,
				header: noXssHeader,
				text: toHtml.html,
				author: article[i].author,
				publishDate: article[i].publishDate,
				image: article[i].image
			}

			function custom_sort(a,b) {
				return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
			}
			articles.sort(custom_sort);
			articles.reverse();
		});

		var articleOnePage = articles.slice(0, 12);

		res.json(articleOnePage);
	})
});

router.get('/article/:id', function(req, res) {

	Article.findById(req.params.id, function(err, data) {
		if(err) console.error;

		if(data) {
			var noXssText = data.text.replace(/<\/?[^>]+>/g,' ');
			var toHtml = bb.process(noXssText);
			var htmlArticle = {
				_id: data._id,
				header: data.header,
				text: toHtml.html,
				author: data.author,
				publishDate: data.publishDate,
				image: data.image
			};
			res.json(htmlArticle);
		}
	})
});

router.delete('/articles/:id', function(req, res) {
	Article.findByIdAndRemove(req.params.id, function(err, data) {
		if(err) console.error;

		res.sendStatus(200);
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
					fs.unlink('public/images/useravatar/' + file.name);
				});
		}
	}), 
	function(req, res) {
		Users.findByIdAndUpdate(req.params.id, { $set: { avatar: req.files.avatar.name } }, function(err) {
			if (err) console.error;
			res.redirect('/');
		});
});

router.get('/login', function(req, res) {
	if(!req.user || !req.user.isAdmin) {
		res.render('part/user-login', {});
	} else {
		res.redirect('/');
	}
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.post('/login', passport.authenticate('local', {
	failureRedirect: '/login'
}), function(req, res) {
	res.redirect('/');
});

router.post('/register', 
	multer({ dest: './public/images/useravatar/', 
		onFileUploadComplete: function(file) {
			var imagePath = file.path;

			gm(imagePath)
				.resize(350,350)
				.write('public/images/useravatar/350x350/' + file.name, function(err) {
					if(err) console.log('Error: ' + err);
					fs.unlink('public/images/useravatar/' + file.name);
				});
		}
	}), 
	function(req, res) {
	if (!req.files.avatar) {
		var defaultUserPlaceholder = 'user-placeholder.png';
		Users.register(new Users({ email: req.body.email, username: req.body.username, avatar: defaultUserPlaceholder }), req.body.password, function(err) {
			if (err) console.error;

			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	} else {
		Users.register(new Users({ email: req.body.email, username: req.body.username, avatar: req.files.avatar.name }), req.body.password, function(err) {
			if (err) console.error;

			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	}
});

router.get('/mailbox', function(req, res) {
	if(!req.user) {
		res.redirect('/');
	} else {
		res.render('mailbox', { user: req.user });
	}
});

router.get('/inbox/:user/:page', function(req, res) {

	if(req.user) {
		Mailbox.find({ to: req.params.user }, function(err, mail) {
			if(err) console.error;

			var page = req.params.page;
			var start = (page - 1) * 10;
			var end = page * 10;
			var mails = [];

			mail.forEach(function(item, i, arr) {

				var noXssText = mail[i].text.replace(/<\/?[^>]+>/g,' ');
				var noXssTopic = mail[i].topic.replace(/<\/?[^>]+>/g,' ');
				var toHtml = bb.process(noXssText);

				mails[i] = {
					_id: mail[i]._id,
					topic: noXssTopic,
					text: toHtml.html,
					from:  mail[i].from,
					date: mail[i].date,
					wasRead: mail[i].wasRead
				}

				function custom_sort(a,b) {
					return new Date(a.date).getTime() - new Date(b.date).getTime();
				}
				mails.sort(custom_sort);
				mails.reverse();
			});

			var mailOnePage = mails.slice(start, end);

			res.json(mailOnePage);
		});
	} else {
		res.redirect('/');
	}
});

router.get('/send/:user/:page', function(req, res) {

	if(req.user) {
		Mailbox.find({ from: req.params.user }, function(err, mail) {
			if(err) console.log(err);

			var page = req.params.page;
			var start = (page - 1) * 10;
			var end = page * 10;
			var mails = [];

			mail.forEach(function(item, i, arr) {

				var noXssText = mail[i].text.replace(/<\/?[^>]+>/g,' ');
				var noXssTopic = mail[i].topic.replace(/<\/?[^>]+>/g,' ');
				var toHtml = bb.process(noXssText);

				mails[i] = {
					_id: mail[i]._id,
					topic: noXssTopic,
					text: toHtml.html,
					to:  mail[i].to,
					date: mail[i].date
				}

				function custom_sort(a,b) {
					return new Date(a.date).getTime() - new Date(b.date).getTime();
				}
				mails.sort(custom_sort);
				mails.reverse();
			});

			var mailOnePage = mails.slice(start, end);

			res.json(mailOnePage);
		});
	} else {
		res.redirect('/');
	}
});

router.get('/mail/:id', function(req, res) {
	if(req.user) {
		Mailbox.findOne({ _id: req.params.id }, function(err, mail) {
			if(err) console.log(err);

			var noXssText = mail.text.replace(/<\/?[^>]+>/g,' ');
			var noXssTopic = mail.topic.replace(/<\/?[^>]+>/g,' ');
			var toHtml = bb.process(noXssText);
			var clearMail;

			clearMail = {
				_id: mail._id,
				from: mail.from,
				to:  mail.to,
				topic: noXssTopic,
				date: mail.date,
				text: toHtml.html,
				wasRead: mail.wasRead
			}

			res.json(clearMail);
		});
	} else {
		res.redirect('/');
	}
});

router.put('/mail/:id', function(req, res) {
	Mailbox.findByIdAndUpdate( req.params.id, { $set: { wasRead: true } }, function(err) {
		if(err) console.log(err);

		res.sendStatus(200);
	});
});

router.delete('/mail/:id', function(req, res) {
	Mailbox.findByIdAndRemove( req.params.id, function(err) {
		if(err) console.log(err);

		res.sendStatus(200);
	});
});


router.get('/*', function(req, res) {
	res.redirect('/');
});


module.exports = router;