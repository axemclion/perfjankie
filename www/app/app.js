angular
	.module('perfjankie', ['ngRoute', 'pageSelect', 'summary', 'navmetrics', 'allmetrics'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.otherwise({
				redirectTo: '/page-select'
			});
		}
	])
	.controller('MainPageCtrl', ['$scope', '$routeParams',
		function($scope, $routeParams) {
			$scope.$on('$routeChangeSuccess', function(scope, next, current) {
				$scope.pagename = $routeParams.pagename;
				$scope.browser = $routeParams.browser;
			});

			$scope.$on('$routeChangeError', function() {
				// TODO - add what happens when routing fails
			});
		}
	]);