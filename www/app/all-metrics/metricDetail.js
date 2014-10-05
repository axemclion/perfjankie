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
	.controller('MetricDetailCtrl', ['$routeParams', 'Data', 'Metadata',
		function($routeParams, Data, Metadata) {
			this.name = $routeParams.metric;
			var self = this;
			this.loading = true;
			this.error = false;
			Data.metricsData($routeParams.browser, $routeParams.pagename, this.name).then(function(data) {
				self.loading = false;
				self.data = data;
				self.unit = Metadata.getAllMetrics()[self.name].unit;
			}, function(err) {
				self.loading = false;
				self.error = err;
			});
		}
	]);