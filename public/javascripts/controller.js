/* Controller */

'use strict';

var appController = angular.module('appController', ['ngAnimate']);

// User side: Check new message
// --------------------------------------------------
appController.controller('navCtrl', ['$scope','$http', function($scope, $http){

	$scope.noMsgNote = false;

	$http({
		method: 'POST',
		url: '/check_mailbox'
	}).
	success(function(data, status, headers, config) {
		$scope.msgCount = data.msgCount;

		if ($scope.msgCount == 0) {
			$scope.noMsgNote = true;
		}
	});

	$scope.mbNewMsgBlock = 'mb-dropdown-hide';

	$scope.showLastMsg = function() {

		if($scope.mbNewMsgBlock == 'mb-dropdown-hide') {

			if($scope.newMsg) {
				$scope.mbNewMsgBlock = 'mb-dropdown-show';
				return;
			} else {
				$http({
					method: 'GET',
					url: '/last_message'
				})
				.success(function(data, status, headers, config) {
					$scope.newMsg = data;
				});
				$scope.mbNewMsgBlock = 'mb-dropdown-show';
			}
		} else {
			$scope.mbNewMsgBlock = 'mb-dropdown-hide';
		}
	}
}]);

// User side: Main page controller
// --------------------------------------------------
appController.controller('mainPageCtrl', ['$scope','LastArticle',
	function($scope, LastArticle){

		LastArticle.api.query(function(data) {
			$scope.articles = data;
		});

		$scope.selectSlide = function(i) {
			$scope.selected = i;
		}

		$scope.articlesGroupClass = 'col-sm-3';

		$scope.changeSize = function(btnNum) {
			switch(btnNum) {
				case 1:
					$scope.articlesGroupClass = 'col-sm-3';
					break;
				case 2:
					$scope.articlesGroupClass = 'col-sm-6';
					break;
				case 3:
					$scope.articlesGroupClass = 'col-sm-12';
					break;
			}
		}
}]);

// User side: Reg form validation
// --------------------------------------------------
appController.controller('formCtrl', ['$scope', 'User',
	function($scope, User) {

		var validClass = 'ng-valid';
		var invalidClass = 'ng-invalid';
		$scope.users = User.api.query();

		$scope.checkUserNickname = function() {
			for(var i = 0; i < $scope.users.length; i++) {
				if ($scope.users[i].username == $scope.userNickname) {
					$scope.note = 'Nickname "' + $scope.userNickname + '" already exist!';
					$scope.nicknameCheck = true;
					$scope.nicknameCheckClass = invalidClass;
					return false;
				} else {
					$scope.note = '';
					$scope.nicknameCheck = false;
					$scope.nicknameCheckClass = validClass;
				}
			}
		}

		$scope.checkUserEmail = function() {
			for(var i = 0; i < $scope.users.length; i++) {
				if ($scope.users[i].email == $scope.userEmail) {
					$scope.note = $scope.userEmail + '" already exist!';
					$scope.emailCheck = true;
					$scope.emailCheckClass = invalidClass;
					return false;
				} else {
					$scope.note = '';
					$scope.emailCheck = false;
					$scope.emailCheckClass = validClass;
				}
			}
		}

		$scope.checkConfirm = function() {
			if ($scope.userPass !== $scope.confirmPass) {
					$scope.note = 'Ivalid confirm pass!';
					$scope.passCheck = true;
					$scope.passCheckClass = invalidClass;
			} else {
				$scope.note = '';
				$scope.passCheck = false;
				$scope.passCheckClass = validClass;
			}
		}
}]);

// User side: content page controller
// --------------------------------------------------
appController.controller('articleListCtrl', ['$scope','$http', 'User',
	function($scope, $http, User) {

		$http.get('/articles')
			.success(function(data, status, headers, config) {
				$scope.articles = data.article;
				$scope.articles.forEach(function(item, i, arr) {
					$scope.articles[i].text = $scope.articles[i].text.replace(/<\/?[^>]+>/g,' ');
				});
			})
			.error(function(data, status, headers, config) {
				console.log('Error');
			});

		var page = 1;

		$scope.onScrollToEnd = function(checker) {
			if(checker) {
				page++;
				$scope.showLoader = true;
				$scope.notLoadMore = false;

				$http.get('/articles/' + page)
					.success(function(data, status, headers, config) {

						if(data.article == '') {
							$scope.notLoadMore = true;
						}

						var article = data.article;

						article.forEach(function(item, i, arr) {
							$scope.articles.push(article[i]);
						});

						$scope.articles.forEach(function(item, i, arr) {
							$scope.articles[i].text = $scope.articles[i].text.replace(/<\/?[^>]+>/g,' ');
						});

						$scope.showLoader = false;
					})
					.error(function(data, status, headers, config) {
						console.log('Error');
					});
			}
		}

}]);

// User side: User profile page controller
// --------------------------------------------------
appController.controller('profileCtrl', ['$rootScope','$scope','User','Country','$routeParams','$location','$http', 
	function($rootScope, $scope, User, Country, $routeParams, $location, $http){
		User.api.get({ username: $routeParams.username }, function(data) {
			if(data.hasOwnProperty('username')) {
				$scope.user = data;

				var author = $scope.user.username;
				var page = 1;
				$rootScope.title = 'Profile: ' + $scope.user.username;
				$scope.msgSuccess = false;

				if(username != $routeParams.username) {
					var profileActionBtn = document.querySelector('#profile-action-user');
					profileActionBtn.remove();
				} else {
					var profileActionBtn = document.querySelector('#profile-action-other-user');
					profileActionBtn.remove();
				}

				$scope.closeFormAndReset = function() {
					$scope.show = false;
					$scope.msgSuccess = false;
					$scope.msgField = $scope.msgTopic = ''; 
				}

				// Send message
				$scope.sendMsg = function() {
					$scope.from = document.getElementById('from').value;
					$scope.to = document.getElementById('to').value;
					$scope.topic = document.getElementById('topic').value;
					$scope.msgText = document.getElementById('msgText').value;

					$http({
						method: 'POST',
						url: '/message',
						data: {from: $scope.from, to: $scope.to, topic: $scope.topic, text: $scope.msgText }
					})
					.success(function(data, status, headers, config) {
						$scope.msgSuccess = true;
					});
				}

				$http.get('/articles/' + author + '/' + page)
					.success(function(data) {
						if(data.articles.length == 0) {
							$scope.notLoadMore = true;
						}
						$scope.articles = data.articles;
					}).
					error(function(data) {
						console.log('Error');
					});

				$scope.loadMoreUserArticles = function() {
					page++;
					$scope.showLoader = true;
					$scope.notLoadMore = false;

					$http.get('/articles/' + author + '/' + page)
						.success(function(data, status, headers, config) {

							if(data.articles == '') {
								$scope.notLoadMore = true;
							}

							var article = data.articles;

							article.forEach(function(item, i, arr) {
								$scope.articles.push(article[i]);
							});

							$scope.showLoader = false;
						})
						.error(function(data, status, headers, config) {
							console.log('Error');
						});
				}
			} else {
				$location.path('/');
			}
		});

		$scope.country = Country.query();
}]);

// User side: Article page controller
// --------------------------------------------------
appController.controller('articleIdCtrl', ['$rootScope','$scope','Article','$routeParams','$sce','$http',
	function($rootScope, $scope, Article, $routeParams, $sce, $http) {
		Article.api.get({ id: $routeParams.articleId }, function(data) {
			$scope.article = data;
			$rootScope.title = $scope.article.header;
			$scope.html = $sce.trustAsHtml($scope.article.text);

			$scope.likes = Article.likeApi.query({ id: $routeParams.articleId }, function() {
				var likeChecker = $scope.checkLike($routeParams.articleId);
				if(likeChecker == true) {
					$scope.liked = { 'color': 'red' };
				}
			});

			$scope.checkLike = function(articleId) {
				var likeChecker = false;

				for(var i = 0; i < $scope.likes.length; i++) {
					if(articleId == $scope.likes[i].articleId && user == $scope.likes[i].userId) {
						likeChecker = true;
					}
				}
				return likeChecker;
			}

			$scope.like = function(id) {

				$scope.likes = Article.likeApi.query({ id: id }, function() {
					var likeChecker = $scope.checkLike(id);

					if(likeChecker == false) {
						$scope.liked = { 'color': 'red' };
						var likeCount = $scope.article.like;
						likeCount++;
						Article.api.like({ id: id, userId: user, likeCount: likeCount }, function(data) {
							$scope.article.like = data.likeCount;
						});
					}
				});
			}
		});
}]);

// User side: Mailbox main page controller
// --------------------------------------------------
appController.controller('mailboxMainCtrl', ['$scope','$http','MsgCount', 
	function($scope, $http, MsgCount){

		$http.post('/check_mailbox')
			.success(function(data) {
				MsgCount.count = data.msgCount;
			});

		$scope.msgCount = MsgCount;
}]);

// User side: inbox controller
// --------------------------------------------------
appController.controller('mailboxInboxCtrl', ['$scope','$http','$location','MsgCount', 
	function($scope, $http, $location, MsgCount){
		var page = 1;

		$http.post('/check_mailbox')
			.success(function(data) {
				MsgCount.count = data.msgCount;
			});

		$http.get('/inbox/' + user + '/' + page)
			.success(function(data, status, headers, config) {
				$scope.mail = data;
				$scope.mail.forEach(function(item, i, arr) {
					$scope.mail[i].text = $scope.mail[i].text.replace(/<\/?[^>]+>/g,' ');
				});
			})
			.error(function(data, status, headers, config) {
				console.log('Error');
			});

		$scope.loadMoreMail = function() {
			page++;
			$scope.showLoader = true;
			$scope.notLoadMore = false;

			$http.get('/inbox/' + user + '/' + page)
				.success(function(data) {

					if(data == '') {
						$scope.notLoadMore = true;
					} else {
						var mail = data;
						mail.forEach(function(item, i, arr) {
							$scope.mail.push(mail[i]);
						});
					}
				})
				.error(function(data) {
					console.log('Error');
				});
		}

}]);

// User side: send message controller
// --------------------------------------------------
appController.controller('mailboxSendCtrl', ['$scope','$http','MsgCount', 
	function($scope, $http, MsgCount){
		var page = 1;

		$http.get('/send/' + user + '/' + page)
			.success(function(data) {
				$scope.mail = data;
				$scope.mail.forEach(function(item, i, arr) {
					$scope.mail[i].text = $scope.mail[i].text.replace(/<\/?[^>]+>/g,' ');
				});
			})
			.error(function(data) {
				console.log('Error');
			});

		$scope.loadMoreMail = function() {
			page++;
			$scope.showLoader = true;
			$scope.notLoadMore = false;

			$http.get('/send/' + user + '/' + page)
				.success(function(data) {

					if(data == '') {
						$scope.notLoadMore = true;
					} else {
						var mail = data;
						mail.forEach(function(item, i, arr) {
							$scope.mail.push(mail[i]);
						});
					}
				})
				.error(function(data) {
					console.log('Error');
				});
		}
}]);

// User side: compose page controller
// --------------------------------------------------
appController.controller('composeCtrl', ['$scope','$http','User','$route', 
	function($scope, $http, User, $route){

		$scope.users = User.api.query();
		$scope.isExist = false;
		$scope.errNoteClass = 'cp-err-note-hide';

		$scope.checkUserExist = function() {
			for(var i = 0; i < $scope.users.length; i++) {
				if($scope.users[i].username == $scope.user) {
					$scope.isExist = true;
					return false;
				} else {
					$scope.isExist = false;
				}
			};
		}

		$scope.sendMessage = function() {
			$scope.from = document.getElementById('from').value;
			$scope.to = document.getElementById('to').value;
			$scope.topic = document.getElementById('topic').value;
			$scope.msgText = document.getElementById('msgText').value;
			$scope.checkUserExist();

			if($scope.user == $scope.from) {
				$scope.errNote = 'You can not send the message to yourself';
				$scope.invalidClass = 'mb-msg-err-invalid';
				$scope.errNoteClass = 'cp-err-note-show';
			} else if($scope.isExist == true) {
				$http({
					method: 'POST',
					url: '/message',
					data: {from: $scope.from, to: $scope.to, topic: $scope.topic, text: $scope.msgText }
				});
				$scope.msgSuccess = true;
				$scope.errNote = '';
			} else {
				$scope.msgSuccess = false;
				$scope.invalidClass = 'mb-msg-err-invalid';
				$scope.errNoteClass = 'cp-err-note-show';
				$scope.errNote = 'User: "' + $scope.to + '" not exist';
			}
		}

		$scope.sendNewMessage = function() {
			$route.reload();
		}
}]);

// User side: Single mail page controller
// --------------------------------------------------
appController.controller('mailCtrl', ['Mail','$scope','$http','$routeParams','$sce','$location', 
	function( Mail, $scope, $http, $routeParams, $sce, $location){
		Mail.api.getMail({ id: $routeParams.id }, function(data) {
			$scope.mail = data;
			$scope.html = $sce.trustAsHtml($scope.mail.text);

			if($scope.mail.wasRead == false && user != $scope.mail.from) {
				Mail.api.change({ id: $scope.mail._id, field: 'wasRead' });
			}

			$scope.deleteMessage = function() {
				if($scope.mail.from == user) {
					Mail.api.change({ id: $scope.mail._id, field: 'showFrom' });
				} else if($scope.mail.to == user) {
					Mail.api.change({ id: $scope.mail._id, field: 'showTo' });
				}
				$location.path('/mailbox');
			}
		});
}]);

// Admin side: user management
// --------------------------------------------------
appController.controller('userListCtrl', ['$scope','AdminUserlist',
	function($scope, AdminUserlist){
		AdminUserlist.api.query(function(data) {
			$scope.users = data;

			$scope.remove = function(user) {
				var index = $scope.users.indexOf(user);
				AdminUserlist.api.remove({ id: user._id });
				$scope.users.splice(index, 1);
			}

			$scope.setAdmin = function(user) {
				AdminUserlist.api.update({ id: user._id }, function() {
					console.log('User update');
				});
			}

			$scope.sortSelect = 'username';
		});
}]);

// Admin side: articles management controller
appController.controller('articleCtrl', ['$scope','$http','Article',
	function($scope, $http, Article) {
		Article.adminApi.get(function(data) {

			function custom_sort(a,b) {
				return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
			}
			data.article.sort(custom_sort);

			$scope.articles = data.article.reverse();

			var page = 1;

			$scope.loadMoreArticles = function() {
				page++;

				$http.get('/articles/' + page)
					.success(function(data) {

						if(data.article == '') {
							$scope.notLoadMore = true;
						}

						var article = data.article;

						article.forEach(function(item, i, arr) {
							$scope.articles.push(article[i]);
						});

						$scope.articles.forEach(function(item, i, arr) {
							$scope.articles[i].text = $scope.articles[i].text.replace(/<\/?[^>]+>/g,' ');
						});

						$scope.showLoader = false;
					})
					.error(function(data) {
						console.log('Error');
					});
			}

			$scope.remove = function(article) {
				var index = $scope.articles.indexOf(article);
				Article.adminApi.delete({ id: article._id });
				$scope.articles.splice(index, 1);
			}

			$scope.sortSelect = 'publishDate';
		});
}]);
