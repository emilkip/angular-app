
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