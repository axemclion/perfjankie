angular
	.module('metricdetail', ['ngRoute', 'Backend', 'graphs'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/detail/:pagename/:browser/:metric', {
				templateUrl: 'app/all-metrics/metric-detail.html',
				controller: 'MetricDetailCtrl',
				controllerAs: 'metric',
				resolve: {
					MetricsList: ['Metadata',
						function(Metadata) {
							return Metadata.getAllMetrics();
						}
					]
				}
			});
		}
	])
	.controller('MetricDetailCtrl', ['$routeParams', 'Data', 'MetricsList',
		function($routeParams, Data, metricsList) {
			this.name = $routeParams.metric;
			var self = this;
			this.error = false;

			var metric = metricsList[self.name];
			this.unit = metric.unit;
			this.stats = metric.stats;

			this.modifier = {
				limit: 10,
				stat: ''
			};

			this.getData = function() {
				this.loading = true;
				Data.metricsData({
					browser: $routeParams.browser,
					pagename: $routeParams.pagename,
					metric: this.name + this.modifier.stat,
					limit: this.modifier.limit
				}).then(function(data) {
					self.data = data;
				}, function(err) {
					self.error = err;
				}).finally(function() {
					self.loading = false;
				});
			};
			this.getData();
		}
	]);