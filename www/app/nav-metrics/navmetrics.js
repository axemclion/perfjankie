angular
	.module('navmetrics', ['ngRoute', 'Backend'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/nav-metrics', {
				templateUrl: 'app/nav-metrics/nav-metrics.html',
				controller: 'NavMetricsCtrl',
				controllerAs: 'navmetrics',
				resolve: {}
			});
		}
	])
	.controller('NavMetricsCtrl', [

		function(PageList) {}
	]);