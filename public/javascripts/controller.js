/* Controller */

'use strict';

var appController = angular.module('appController', []);

// Client side: Reg form validation
appController.controller('formCtrl', ['$scope', 'User', '$resource',
	function($scope, User, $recource) {
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
		};

		$scope.checkUserEmail = function() {
			$scope.users = data;
			for(var i = 0; i < $scope.users.length; i++) {
				if ($scope.users[i].email == $scope.userEmail) {
					$scope.note = 'Email "' + $scope.userEmail + '" already exist!';
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
					//$scope.confirmPass = $scope.confirmPass.$invalid;
			} else {
				$scope.note = '';
				$scope.checker = false;
			}
		};
}]);

// Admin side: user management
appController.controller('userListCtrl', ['$scope','User', '$resource',
	function($scope, User){
		User.api.query(function(data) {
			$scope.users = data;

			$scope.remove = function(user) {
				var index = $scope.users.indexOf(user);
				User.api.remove({ id: user._id }, function() {
					$scope.users.splice(index, 1);
				});
			};

			$scope.setAdmin = function(user) {
				User.api.update({ id: user._id }, function() {
					console.log('User update');
				});
			};
		});
	$scope.sortItem = 'username';
}]);

// Client side
appController.controller('articleListCtrl', ['$scope','Article', '$resource',
	function($scope, Article) {
		Article.api.query(function(data) {
			$scope.articles = data.reverse();
			console.log($scope.articles);
		});

		$scope.onScrollToEnd = function(checker) {
			if(checker) $scope.lim += 5;
		};

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
				Article.api.remove({ id: articles._id }, function() {
					$scope.articles.splice(index, 1);
				});
			};
		});
}]);
