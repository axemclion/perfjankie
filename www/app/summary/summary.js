angular
	.module('summary', ['ngRoute', 'paintCycleGraph', 'networkTiming', 'Backend'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/summary', {
				templateUrl: 'app/summary/summary.html',
				controller: 'SummaryCtrl',
				controllerAs: 'summary',
				resolve: {
					runList: ['Data', '$route',
						function(data, $route) {
							var res = {};
							var params = $route.current.params;
							return data.runList({
								browser: params.browser,
								pagename: params.pagename
							});
						}
					],
				}
			});
		}
	])
	.controller('SummaryCtrl', ['$routeParams', '$location', 'runList', 'Data',
		function($routeParams, $location, runList, Data) {
			this.time = $routeParams.time || runList[0].time;
			this.runList = runList;
			var self = this;

			this.showRun = function(pagename, browser, time) {
				$location.url(['/summary?pagename=', pagename, '&browser=', browser, '&time=', time].join(''));
			};

			this.tiles = [];
			this.currentRunData = {};
			var metric = 'framesPerSec_raf';

			Data.runData({
				browser: $routeParams.browser,
				pagename: $routeParams.pagename,
				time: this.time
			}).then(function(data) {
				self.currentRunData = data;
				Data.metricsData({
					browser: $routeParams.browser,
					pagename: $routeParams.pagename,
					metric: data['frames_per_sec'] ? 'frames_per_sec' : 'framesPerSec_raf',
					limit: 20
				}).then(function(data) {
					self.frameRateData = data;
				});
			});
		}
	]);