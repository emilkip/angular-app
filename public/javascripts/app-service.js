'use strict';

var appService = angular.module('appService', ['ngResource']);

appService.factory('User', ['$resource', 
	function($resource){
		return {
			api: $resource('/member_list/:id', {}, {
				update: {
					method: 'PUT',
					params: { id: '@id' }
				}
			}),
			avatar: $resource('/user/avatar/:id', {}, {
				update: {
					method: 'PUT',
					params: { id: '@id' }
				}
			})
		}
	}
]);

appService.factory('AdminUserlist', ['$resource', 
	function($resource){
		return {
			api: $resource('/admin_userlist/:id', {}, {
				update: {
					method: 'PUT',
					params: { id: '@id' }
				}
			})
		}
	}
]);

appService.factory('Article', ['$resource', 
	function($resource){
		return {
			api: $resource('/article/:id', {}, {
				get: {
					method: 'GET',
					params: { id: '@id' }
				}
			})
		}
	}
]);