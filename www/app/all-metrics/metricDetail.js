angular
	.module('metricdetail', ['ngRoute', 'Backend'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/metric-detail', {
				templateUrl: 'app/all-metrics/metric-detail.html',
				controller: 'MetricDetailCtrl',
				controllerAs: 'metric',
			});
		}
	])
	.controller('MetricDetailCtrl', ['$routeParams',
		function($routeParams) {
			this.name = $routeParams.metric;
		}
	]);