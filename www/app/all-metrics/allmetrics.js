angular
	.module('allmetrics', ['ngRoute', 'Backend', 'metricdetail'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/all-metrics', {
				templateUrl: 'app/all-metrics/all-metrics.html',
				controller: 'AllMetricsCtrl',
				controllerAs: 'metrics',
				resolve: {
					MetricNames: ['Metadata',
						function(Metadata, $routeParams) {
							return Metadata.getAllMetrics();
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
	.filter("formatMetric", function() {
		return function(input) {
			input = input.replace(/_/, " ").replace(/([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g, "$1$4 $2$3$5");
			return input.toLowerCase().replace(/([^a-z]|^)([a-z])(?=[a-z]{2})/g, function(_, g1, g2) {
				return g1 + g2.toUpperCase();
			});
		};
	})
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