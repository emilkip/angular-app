
(function() {

    /*Config*/
    var moduleName = 'angularUtils.directives.dirDisqus';

    /*Module*/
    var module;
    try {
        module = angular.module(moduleName);
    } catch(err) {
        module = angular.module(moduleName, ['ngRoute']);
    }

    module.directive('dirDisqus', ['$window','$routeParams','$location', function($window,$routeParams,$location) {
        return {
            restrict: 'E',
            scope: {
                disqus_shortname: '@disqusShortname',
                disqus_identifier: '@disqusIdentifier',
                disqus_title: '@disqusTitle',
                disqus_url: '@disqusUrl',
                disqus_category_id: '@disqusCategoryId',
                disqus_disable_mobile: '@disqusDisableMobile',
                disqus_config_language : '@disqusConfigLanguage',
                readyToBind: '@'
            },
            template: '<div id="disqus_thread"></div><a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>',
            link: function(scope) {
                if (typeof scope.disqus_identifier === 'undefined' || typeof scope.disqus_url === 'undefined') {
                    throw "Please ensure that the `disqus-identifier` and `disqus-url` attributes are both set.";
                }

                scope.$watch("readyToBind", function(isReady) {

                    if ( !angular.isDefined( isReady ) ) {
                        isReady = "true";
                    }
                    if (scope.$eval(isReady)) {
                        $window.disqus_shortname = scope.disqus_shortname;
                        $window.disqus_identifier = scope.disqus_identifier;
                        $window.disqus_title = scope.disqus_title;
                        $window.disqus_url = $location.host() + ':' + $location.$$port + '/#!/article/' + $routeParams.articleId;
                        $window.disqus_category_id = scope.disqus_category_id;
                        $window.disqus_disable_mobile = scope.disqus_disable_mobile;
                        $window.disqus_config =  function () {
                            this.language = scope.disqus_config_language;
                        };
                        if (!$window.DISQUS) {
                            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; 
                            dsq.async = true;
                            dsq.src = '//' + scope.disqus_shortname + '.disqus.com/embed.js';
                            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
                        } else {
                            $window.DISQUS.reset({
                                reload: true,
                                config: function () {
                                    this.page.identifier = scope.disqus_identifier;
                                    this.page.url = $location.host() + ':' + $location.$$port + '/#!/article/' + $routeParams.articleId;
                                    this.page.title = scope.disqus_title;
                                    this.language = scope.disqus_config_language;
                                }
                            });
                        }
                    }
                });
            }
        };
    }]);

})();
