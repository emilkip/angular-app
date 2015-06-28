'use strict';

var appService = angular.module('appService', ['ngResource']);

appService.factory('User', ['$resource', 
	function($resource){
		return {
			api: $resource('/member_list/:username', {}, {
				get: {
					method: 'GET',
					params: { usename: '@username' }
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

appService.factory('Mail', ['$resource', 
	function($resource){
		return {
			api: $resource('/mail/:id', {}, {
				getMail: {
					method: 'GET',
					params: { id: '@id' }
				},
				readIsTrue: {
					method: 'PUT',
					params: { id: '@id' }
				}

			})
		};
}])

appService.factory('MsgCount', 
	function(){
		return {
			count: 0
		};
});

appService.factory('Article', ['$resource', 
	function($resource){
		return {
			api: $resource('/article/:id', {}, {
				get: {
					method: 'GET',
					params: { id: '@id' }
				}
			}),
			adminApi: $resource('/articles/:id', {}, {
				get: {
					method: 'GET',
					params: { id: '@id' }
				},
				delete: {
					method: 'DELETE',
					params: { id: '@id' }
				}
			})
		}
	}
]);

appService.factory('LastArticle', ['$resource', 
	function($resource){
		return {
			api: $resource('/last_articles', {}, {
				get: {
					method: 'GET'
				}
			})
		}
	}
]);