/* Main module */

'use strict';

var mainModule = angular.module('mainModule', ['ngRoute','appController','appService']);

mainModule.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/main', {
			templateUrl: '/part/main.jade'
			//controller: ''
		})
		.when('/content', {
			templateUrl: '/part/content.jade',
			controller: 'articleCtrl'
		})
		.when('/reg', {
			templateUrl: '/part/reg.jade',
			controller: 'formCtrl'
		})
		.when('/user', {
			templateUrl: '/part/users.jade',
			controller: 'userListCtrl'
		})
		.otherwise({
			redirectTo: '/main'
		});
}]);

var adminModule = angular.module('adminModule', ['ngRoute','appController','appService']);

adminModule.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/userlist', {
			templateUrl: '/part/users.jade',
			controller: 'userListCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);


/* Filters */

var filterModule = angular.module('filterModule', []);
