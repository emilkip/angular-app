/* Main module */

'use strict';

var mainModule = angular.module('mainModule', ['ngRoute','appController','appService']);

mainModule.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/main', {
			title: 'Angular app',
			templateUrl: '/part/main.jade'
			//controller: ''
		})
		.when('/content', {
			title: 'Article',
			templateUrl: '/part/content.jade',
			controller: 'articleListCtrl'
		})
		.when('/article/:articleId', {
			title: 'Article: ',
			templateUrl: '/part/article.jade',
			controller: 'articleIdCtrl'
		})
		.when('/reg', {
			title: 'Sign in',
			templateUrl: '/part/reg.jade',
			controller: 'formCtrl'
		})
		.otherwise({
			redirectTo: '/main'
		});
}]);

mainModule.run(['$location', '$rootScope', function($location, $rootScope) {
	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		$rootScope.title = current.$$route.title;
	});
}]);

var adminModule = angular.module('adminModule', ['ngRoute','appController','appService']);

adminModule.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/userlist', {
			templateUrl: '/part/users.jade',
			controller: 'userListCtrl'
		})
		.when('/article', {
			templateUrl: '/part/article-manage.jade',
			controller: 'articleCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);


/* Filters */

var filterModule = angular.module('filterModule', []);
