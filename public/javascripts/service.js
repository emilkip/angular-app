'use strict';

var appService = angular.module('appService', ['ngResource']);

appService.factory('User', ['$resource', 
	function($resource){
		return {
			api: $resource('/data/:id', {}, {
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
			api: $resource('/article')
		}
	}
]);