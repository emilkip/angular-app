'use strict';

var express = require('express');
var passport = require('passport');
var Users = require('../models/users');
var Article = require('../models/articles');
var router = express.Router();


router.get('/', function(req, res) {
	res.render('index', { user : req.user });
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
		res.render('part/create', {});
	}
});

router.post('/create', function(req, res) {
	var article = new Article({ header: req.body.header, text: req.body.text, author: req.user.username});
	article.save(function(err, article) {
		if(err) console.log('Create error!');
		res.redirect('/');
	});
});

router.get('/admin', function(req, res) {
	if(!req.user || !req.user.isAdmin) {
		res.redirect('/');
	} else {
		res.render('admin', {});
	}
});

router.get('/data', function(req, res) {
	Users.find({}, function(err,data) {
		if(err) console.error;
		res.json(data);
	});
});

router.get('/article', function(req, res) {
	Article.find({}, function(err,data) {
		if(err) console.error;
		res.json(data);
	});
});

router.put('/data/:id', function(req, res) {
	Users.findById(req.params.id, function(err, editUser) {
		if(err) console.error;
		if(editUser.isAdmin == false) {
			Users.findByIdAndUpdate(req.params.id, { $set: { isAdmin: true } }, function(err, user) {
				if(err) console.error;
			});
		} else {
			Users.findByIdAndUpdate(req.params.id, { $set: { isAdmin: false } }, function(err, user) {
				if(err) console.error;
			});
		}
		res.json(editUser);
	});
});

router.delete('/data/:id', function(req, res) {
	Users.findByIdAndRemove(req.params.id, function(err, user) {
		if(err) console.error;
		res.json(user);
	});
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.post('/login', passport.authenticate('local'), function(req, res) {
	res.redirect('/');
});

router.post('/register', function(req, res) {
	Users.register(new Users({ username: req.body.username, email: req.body.email }), req.body.password, function(err, user) {
		if (err) console.error;

		passport.authenticate('local')(req, res, function () {
			res.redirect('/');
		});
	});
});


module.exports = router;