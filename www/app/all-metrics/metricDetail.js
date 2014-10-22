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
					],
					Data: ['Data', '$route',
						function(Data, $route) {
							$route.current.params.limit = $route.current.params.limit || 10;
							$route.current.params.stat = $route.current.params.stat || '';

							var params = $route.current.params;
							return Data.metricsData({
								browser: params.browser,
								pagename: params.pagename,
								metric: params.metric + params.stat,
								limit: params.limit === 'all' ? undefined : params.limit
							});
						}
					]
				}
			});
		}
	])
	.controller('MetricDetailCtrl', ['$routeParams', '$scope', '$location', 'Data', 'MetricsList',
		function($routeParams, $scope, $location, data, metricsList) {
			this.name = $routeParams.metric;
			this.data = data;
			var metric = metricsList[this.name];
			if (metric) {
				this.unit = metric.unit;
				this.stats = metric.stats;
			}

			$scope.modifier = {
				limit: $routeParams.limit,
				stat: $routeParams.stat
			};

			$scope.$watchCollection('modifier', function(val, old, scope) {
				if ($routeParams.stat !== val.stat) {
					$location.search('stat', val.stat);
				} else if ($routeParams.limit !== val.limit) {
					$location.search('limit', val.limit);
				}
			});
		}
	]);