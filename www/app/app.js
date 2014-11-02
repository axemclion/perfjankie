angular
	.module('perfjankie', ['ngRoute', 'sidebar', 'pageSelect', 'summary', 'navmetrics', 'allmetrics'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.otherwise({
				redirectTo: '/page-select'
			});
		}
	])
	.controller('MainPageCtrl', ['$scope', '$location', '$routeParams',
		function($scope, $location, $routeParams) {
			$scope.$on('$routeChangeSuccess', function(scope, next, current) {
				$scope.pagename = $routeParams.pagename;
				$scope.browser = $routeParams.browser;
				$scope.pageLoading = false;
			});

			$scope.$on('$routeChangeStart', function() {
				$scope.pageLoading = true;
			});

			$scope.$on('$routeChangeError', function(a, b, c, err) {
				$scope.pageError = true;
				$scope.pageLoading = false;
			});

			$scope.goHome = function() {
				$location.url('/page-select');
				window.document.location.reload();
			};

			if (window.location !== window.top.location) {
				$scope.noPjBrand = true;
			}
		}
	])
	.filter('formatMetric', function() {
		return function(input) {
			input = input.replace(/_/g, " ").replace(/([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g, "$1$4 $2$3$5");
			return input.toLowerCase().replace(/([^a-z]|^)([a-z])(?=[a-z]{2})/g, function(_, g1, g2) {
				return g1 + g2.toUpperCase();
			});
		};
	})
	.filter('formatMetricValue', ['$filter',
		function($filter) {
			return function(value, unit) {
				var fraction = 0;
				if (unit === 'ms' || unit === 'fps') {
					fraction = 2;
				}
				if (value > 1000) {
					return $filter('number')(value / 1000, value > 100000 ? 0 : 2) + 'K';
				} else {
					return $filter('number')(value, fraction);
				}
			};
		}
	]);