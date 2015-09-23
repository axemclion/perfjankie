angular
	.module('metricdetail', ['ngRoute', 'metricsGraphDetails', 'Backend'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/detail', {
				templateUrl: 'app/metric-details/metric-detail.html',
				controller: 'MetricDetailCtrl',
				controllerAs: 'metric',
				resolve: {
					MetricsList: ['Data',
						function(data) {
							return data.getAllMetrics();
						}
					],
					Data: ['Data', '$route',
						function(Data, $route) {
							$route.current.params.limit = $route.current.params.limit || 40;
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
			for (var i = 0; i < metricsList.length; i++){
				if (metricsList[i].name === this.name){
					this.metadata = metricsList[i];
					break;
				}
			}
			$scope.modifier = {
				limit: $routeParams.limit,
				stat: $routeParams.stat
			};

			var pos = $('.graph').position();

			// Sets height of graph with a minimum of 500px
			this.height = Math.max(window.innerHeight - pos.top - 100, 500);

			$scope.$watchCollection('modifier', function(val, old, scope) {
				if ($routeParams.stat !== val.stat) {
					$location.search('stat', val.stat);
				} else if ($routeParams.limit !== val.limit) {
					$location.search('limit', val.limit);
				}
			});
		}
	]);