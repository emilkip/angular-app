/* Main module */

'use strict';

var mainModule = angular.module('mainModule', [
	'ngRoute',
	'ngAnimate',
	'appController',
	'appService',
	'appDirective',
	'ui.bootstrap.carousel',
	'angularUtils.directives.dirDisqus'
]);

mainModule.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/main', {
			title: 'Angular app',
			templateUrl: '/part/main.jade',
			controller: 'mainPageCtrl'
		})
		.when('/content', {
			title: 'Articles',
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

	$locationProvider.hashPrefix('!');

}]);

mainModule.run(['$location', '$rootScope', function($location, $rootScope) {
	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		if (current.hasOwnProperty('$$route')) {
			$rootScope.title = current.$$route.title;
		}
	});
}]);

var adminModule = angular.module('adminModule', [
	'ngRoute',
	'appController',
	'appService'
]);

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


