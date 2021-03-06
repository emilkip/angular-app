'use strict';

var express = require('express');
var passport = require('passport');
var multer = require('multer');
var bb = require('epochtalk-bbcode-parser');
var fs = require('fs');
var gm = require('gm');
var router = express.Router();
var app = express();

// Models
var Users = require('../models/users');
var Article = require('../models/articles');
var Mailbox = require('../models/mailbox');
var ArticleLike = require('../models/article-like');


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

	res.render('part/' + filename, { user : req.user });
});

router.post('/profile/:id', function(req, res) {
	if(req.user) {
		Users.findByIdAndUpdate(req.params.id, { $set: { country: req.body.country, birthday: req.body.date, site: req.body.site }}, function(err, data) {
			if(err) console.log(err);

			res.redirect('/#!/profile/' + data.username);
		});
	} else {
		res.sendStatus(403);
	}
});

router.post('/message', function(req, res) {
	if(req.user) {
		var message = new Mailbox({ from: req.body.from, to: req.body.to, topic: req.body.topic, text: req.body.text, date: dateNow() });
		message.save(function(err) {
			if(err) console.log(err);

			res.sendStatus(200);
		});
	} else {
		res.sendStatus(403);
	}
});

router.post('/check_mailbox', function(req, res) {
	Mailbox.find({ to: req.user.username, wasRead: false }, function(err, messages) {
		if(err) console.log(err);

		var msgCount = messages.length;
		res.json({ msgCount: msgCount });
	});
});

router.get('/last_message', function(req, res) {

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

			if(file.size <= 100000) {
				gm(imagePath)
					.write('public/images/uploads/article_img/' + file.name, function(err) {
						if(err) console.log('Error: ' + err);
						fs.unlink('public/images/uploads/' + file.name);
					});
			} else if(file.mimetype == 'image/gif') {
				fs.unlink('public/images/uploads/' + file.name);
			} else {
				gm(imagePath)
					.resize(900,720)
					.quality(80)
					.write('public/images/uploads/article_img/' + file.name, function(err) {
						if(err) console.log('Error: ' + err);
						fs.unlink('public/images/uploads/' + file.name);
					});
				gm(imagePath)
					.resize(400,720)
					.quality(80)
					.write('public/images/uploads/article_img_mini/' + file.name, function(err) {
						if(err) console.log('Error: ' + err);
						fs.unlink('public/images/uploads/' + file.name);
					});
			}
		}
	}), 
	function(req, res) {

		if(!req.files.thumb || req.files.thumb.mimetype == 'image/gif') {
			var defaultUserPlaceholder = 'article-placeholder.png';
			var article = new Article({ header: req.body.header, text: req.body.text, author: req.user.username, authorAvatar: req.user.avatar, publishDate: dateNow(), image: defaultUserPlaceholder });

			article.save(function(err) {
				if(err) console.log(err);
				res.redirect('/');
			});
		} else {
			var article = new Article({ header: req.body.header, text: req.body.text, author: req.user.username, authorAvatar: req.user.avatar, publishDate: dateNow(), image: req.files.thumb.name });

			article.save(function(err, article) {
				if(err) console.log(err);
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
			if(err) console.log(err);
			res.json(data);
		});
	}
});

router.put('/admin_userlist/:id', function(req, res) {
	if(req.user) {
		if(req.user.isAdmin) {
			Users.findById(req.params.id, function(err, data) {
				if(err) console.log(err);
				if(data.isAdmin == false) {
					Users.findByIdAndUpdate(req.params.id, { $set: { isAdmin: true } }, function(err) {
						if(err) console.log(err);

						res.sendStatus(200);
					});
				} else {
					Users.findByIdAndUpdate(req.params.id, { $set: { isAdmin: false } }, function(err) {
						if(err) console.log(err);

						res.sendStatus(200);
					});
				}
			});
		} else res.sendStatus(403);

	} else res.sendStatus(403);

});

router.delete('/admin_userlist/:id', function(req, res) {
	if(req.user) {
		if(req.user.isAdmin) {
			Users.findByIdAndRemove(req.params.id, function(err) {
				if(err) console.log(err);

				res.sendStatus(200);
			});
		} else res.sendStatus(403);

	} else res.sendStatus(403);
});

router.get('/member_list', function(req, res) {
	Users.find({}, function(err, data) {
		if(err) console.log(err);
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
	if(req.user) {
		Users.findOne({ username: req.params.username }, function(err, data) {
			if(err) console.log(err);

			if(data) {
				var user = {};

				user = {
					_id: data._id,
					username: data.username,
					avatar: data.avatar,
					country: data.country,
					birthday: data.birthday,
					site: data.site
				};

				res.json(user);
			}
		});
	} else {
		res.redirect('/');
	}
	
});

router.get('/articles', function(req, res) {

	Article.find({}, function(err, article) {
		if(err) console.log(err);

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
				image: article[i].image,
				like: article[i].like
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
		if(err) console.log(err);

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
		if(err) console.log(err);

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
		if(err) console.log(err);

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
		if(err) console.log(err);

		if(data) {
			var noXssText = data.text.replace(/<\/?[^>]+>/g,' ');
			var toHtml = bb.process(noXssText);
			var htmlArticle = {
				_id: data._id,
				header: data.header,
				text: toHtml.html,
				author: data.author,
				publishDate: data.publishDate,
				image: data.image,
				like: data.like
			};
			res.json(htmlArticle);
		}
	})
});

router.put('/article/:id', function(req, res) {

	Article.findByIdAndUpdate(req.params.id, { $set: { like: req.body.likeCount } },
		function(err) {
			if(err) console.log(err);

			res.send(req.body.count);
		});

	var like = new ArticleLike({ articleId: req.body.id, userId: req.body.userId });
	like.save(function(err) {
		if(err) console.log(err);
	});
});

router.get('/article/like/:id', function(req, res) {
	ArticleLike.find({ articleId: req.params.id }, function(err, data) {
		if(err) console.log(err);

		res.json(data);
	});
});

router.delete('/articles/:id', function(req, res) {
	if(req.user) {
		if(req.user.isAdmin) {
			Article.findByIdAndRemove(req.params.id, function(err, data) {
				if(err) console.log(err);

				res.sendStatus(200);
			});
		} else res.sendStatus(403);

	} else res.sendStatus(403);

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
			if (err) console.log(err);
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

			if(file.mimetype == 'image/gif') {
				fs.unlink('public/images/uploads/' + file.name);
			} else {
				gm(imagePath)
					.resize(350,350)
					.write('public/images/useravatar/350x350/' + file.name, function(err) {
						if(err) console.log('Error: ' + err);
						fs.unlink('public/images/useravatar/' + file.name);
					});
			}
		}
	}), 
	function(req, res) {
	if (!req.files.avatar || req.files.avatar.mimetype == 'image/gif') {
		var defaultUserPlaceholder = 'user-placeholder.png';
		Users.register(new Users({ email: req.body.email, username: req.body.username, avatar: defaultUserPlaceholder, regDate: dateNow() }), req.body.password, function(err) {
			if (err) console.log(err);

			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	} else {
		Users.register(new Users({ email: req.body.email, username: req.body.username, avatar: req.files.avatar.name, regDate: dateNow() }), req.body.password, function(err) {
			if (err) console.log(err);

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

	if(req.user.username == req.params.user) {
		Mailbox.find({ to: req.params.user, showTo: true }, function(err, mail) {
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

	if(req.user.username == req.params.user) {
		Mailbox.find({ from: req.params.user, showFrom: true }, function(err, mail) {
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
	if(req.user) {
		if(req.body.field == 'wasRead') {
			Mailbox.findByIdAndUpdate( req.params.id, { $set: { wasRead: true } }, function(err) {
				if(err) console.log(err);

				res.sendStatus(200);
			});
		} else if(req.body.field == 'showTo') {
			Mailbox.findByIdAndUpdate( req.params.id, { $set: { showTo: false } }, function(err) {
				if(err) console.log(err);

				res.sendStatus(200);
			});
		} else if(req.body.field == 'showFrom') {
			Mailbox.findByIdAndUpdate( req.params.id, { $set: { showFrom: false } }, function(err) {
				if(err) console.log(err);

				res.sendStatus(200);
			});
		}
	} else {
		res.sendStatus(403);
	}
});

router.get('/*', function(req, res) {
	res.redirect('/');
});


module.exports = router;