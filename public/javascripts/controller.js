/* Controller */

'use strict';

var appController = angular.module('appController', []);

appController.controller('mainPageCtrl', ['$scope','Article',
	function($scope, Article){

		Article.api.query(function(data) {
			function custom_sort(a,b) {
				return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
			}
			data.sort(custom_sort);
			$scope.articles = data.reverse();
		});

		$scope.selectSlide = function(i) {
			$scope.selected = i;
		}

		$scope.class = 'col-sm-3';

		$scope.changeSize = function(btnNum) {
			switch(btnNum) {
				case 1:
					$scope.class = 'col-sm-3';
					break;
				case 2:
					$scope.class = 'col-sm-6';
					break;
				case 3:
					$scope.class = 'col-sm-12';
					break;
			}
		}
}]);

// Client side: Reg form validation
appController.controller('formCtrl', ['$scope', 'User',
	function($scope, User) {

		var data = User.api.query();
		$scope.checker = false;
		$scope.showForm = true;
		$scope.showSuccessMsg = false;
		$scope.us = data;

		$scope.checkUserNickname = function() {
			$scope.users = data;
			for(var i = 0; i < $scope.users.length; i++) {
				if ($scope.users[i].username == $scope.userNickname) {
					$scope.note = 'Nickname "' + $scope.userNickname + '" already exist!';
					$scope.checker = true;
					return false;
				} else {
					$scope.note = '';
					$scope.checker = false;
				}
			}
		}

		$scope.checkConfirm = function() {
			if ($scope.userPass !== $scope.confirmPass) {
					$scope.note = 'Ivalid confirm pass!';
					$scope.checker = true;
			} else {
				$scope.note = '';
				$scope.checker = false;
			}
		}
}]);

// Admin side: user management
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
		});
	$scope.sortItem = 'username';
}]);

// Client side
appController.controller('articleListCtrl', ['$scope','Article',
	function($scope, Article) {
		Article.api.query(function(data) {

			function custom_sort(a,b) {
				return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
			}
			data.sort(custom_sort);
			$scope.articles = data.reverse();
		});

		$scope.onScrollToEnd = function(checker) {
			if(checker) $scope.lim += 5;
		}

	$scope.limit = 5;
	$scope.lim = 5;
}]);

appController.controller('articleIdCtrl', ['$scope','Article','$routeParams',
	function($scope, Article, $routeParams) {
		Article.api.get({ id: $routeParams.articleId }, function(data) {
			$scope.article = data;
		});
}]);

// Admin side: article management
appController.controller('articleCtrl', ['$scope','Article',
	function($scope, Article) {
		Article.api.query(function(data) {
			$scope.articles = data.reverse();

			$scope.remove = function(articles) {
				var index = $scope.articles.indexOf(articles);
				Article.api.remove({ id: articles._id });
				$scope.articles.splice(index, 1);
			}
		});
}]);
