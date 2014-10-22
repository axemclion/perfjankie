angular
	.module('allmetrics', ['ngRoute', 'Backend', 'metricdetail'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/all-metrics', {
				templateUrl: 'app/all-metrics/all-metrics.html',
				controller: 'AllMetricsCtrl',
				controllerAs: 'metrics',
				resolve: {
					MetricNames: ['Data',
						function(data, $routeParams) {
							return data.getAllMetrics();
						}
					]
				}
			});
		}
	])
	.controller('AllMetricsCtrl', ['$routeParams', 'MetricNames',
		function($routeParams, MetricNames) {
			this.metricNames = MetricNames;
		}
	])
	.filter('metricFilter', ['$filter',
		function($filter) {
			return function(input, query) {
				if (!query) {
					return input;
				}
				var result = {};
				var regex = new RegExp(query, 'i');
				var filter = $filter('formatMetric');
				for (var key in input) {
					if (regex.test(filter(key))) {
						result[key] = input[key];
					}
				}
				return result;
			};
		}
	]);