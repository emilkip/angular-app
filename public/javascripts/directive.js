
var appDirective = angular.module('appDirective',[]);

appDirective.directive('scroll', function(){
	return {
		restrict: 'A',
		scope: {
			scroll: '&'
		},
		link: function($scope, element, attr) {
			$(document).scroll(function() {
				$scope.$apply(function() {
					if($(window).scrollTop() + $(window).height() == $(document).height()) {
						$scope.scroll({checker: true});
					}
				});
			})
		}
	}
});

appDirective.directive('imageCenter', function() {
	return {
		restrict: 'A',
		scope: '&',
		link: function($scope, element, attr) {
			element.bind('load', function() {
				var img = element.context;
				if(img) {
					if (img.clientWidth == img.clientHeight) {
						element.addClass('square-img');
					} else if(img.clientWidth > img.clientHeight) {
						element.addClass('horizontal-center');
					} else {
						element.addClass('vertical-center');
					}
				}
			});
		}
	}
});