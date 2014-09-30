angular
	.module('perfjankie', ['ngRoute', 'sidebar', 'pageSelect', 'summary', 'navmetrics', 'allmetrics'])
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
	]).filter("formatMetric", function() {
		return function(input) {
			input = input.replace(/_/, " ").replace(/([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g, "$1$4 $2$3$5");
			return input.toLowerCase().replace(/([^a-z]|^)([a-z])(?=[a-z]{2})/g, function(_, g1, g2) {
				return g1 + g2.toUpperCase();
			});
		};
	});