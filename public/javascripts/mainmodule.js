/* Main module */

'use strict';

// Main module
// --------------------------------------------------
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
			templateUrl: '/part/user-main.jade',
			controller: 'mainPageCtrl'
		})
		.when('/content', {
			title: 'Articles',
			templateUrl: '/part/user-content.jade',
			controller: 'articleListCtrl'
		})
		.when('/article/:articleId', {
			title: '',
			templateUrl: '/part/user-article.jade',
			controller: 'articleIdCtrl'
		})
		.when('/reg', {
			title: 'Sign in',
			templateUrl: '/part/user-reg.jade',
			controller: 'formCtrl'
		})
		.when('/profile/:username', {
			title: '',
			templateUrl: '/part/user-profile.jade',
			controller: 'profileCtrl'
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

// Mailbox module
// --------------------------------------------------
var mailboxModule = angular.module('mailboxModule', [
	'ngRoute',
	'appController',
	'appService'
]);

mailboxModule.config(['$routeProvider',function($routeProvider) {
	$routeProvider
		.when('/inbox', {
			templateUrl: 'part/mailbox-inbox.jade',
			controller: 'mailboxInboxCtrl'
		})
		.when('/send', {
			templateUrl: 'part/mailbox-send-list.jade',
			controller: 'mailboxSendCtrl'
		})
		.when('/mail/:id', {
			templateUrl: 'part/mailbox-mail.jade',
			controller: 'mailCtrl'
		})
		.when('/compose', {
			templateUrl: 'part/mailbox-compose.jade',
			controller: 'composeCtrl'
		})
		.otherwise({
			redirectTo: '/inbox'
		})
}]);

// Admin module
// --------------------------------------------------
var adminModule = angular.module('adminModule', [
	'ngRoute',
	'appController',
	'appService'
]);

adminModule.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/userlist', {
			templateUrl: '/part/admin-users.jade',
			controller: 'userListCtrl'
		})
		.when('/article', {
			templateUrl: '/part/admin-article.jade',
			controller: 'articleCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);


