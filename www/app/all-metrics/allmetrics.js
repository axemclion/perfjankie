angular
	.module('allmetrics', ['ngRoute', 'Backend'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/all-metrics', {
				templateUrl: 'app/all-metrics/all-metrics.html',
				controller: 'AllMetricsCtrl',
				controllerAs: 'metrics',
				resolve: {
					Metrics: ['Metadata',
						function(Metadata) {
							return Metadata.getAllMetrics();
						}
					]
				}
			});
		}
	])
	.controller('AllMetricsCtrl', [

		function(PageList) {}
	]);