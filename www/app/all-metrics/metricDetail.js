angular
	.module('metricdetail', ['ngRoute', 'Backend', 'graphs'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/metric-detail', {
				templateUrl: 'app/all-metrics/metric-detail.html',
				controller: 'MetricDetailCtrl',
				controllerAs: 'metric'
			});
		}
	])
	.controller('MetricDetailCtrl', ['$routeParams', 'Data',
		function($routeParams, Data) {
			this.name = $routeParams.metric;
			var self = this;
			Data.metricsData($routeParams.browser, $routeParams.pagename, this.name).then(function(data) {
				self.data = data;
			}, function(err) {
				self.error = err;
			});
		}
	]);