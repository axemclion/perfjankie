angular
	.module('metricdetail', ['ngRoute', 'Backend', 'graphs'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/detail/:pagename/:browser/:metric', {
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
			this.error = false;

			var metric = Metadata.getAllMetrics()[self.name];
			this.unit = metric.unit;
			this.stats = metric.stats;

			this.modifier = {
				limit: 10,
				stat: ''
			};

			this.getData = function() {
				this.loading = true;
				Data.metricsData($routeParams.browser, $routeParams.pagename, this.name + this.modifier.stat, this.modifier.limit).then(function(data) {
					self.loading = false;
					self.data = data;
				}, function(err) {
					self.loading = false;
					self.error = err;
				});
			};
			this.getData();
		}
	]);