angular
	.module('summary', ['ngRoute', 'paintCycleGraph', 'summaryTiles', 'Backend'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/summary', {
				templateUrl: 'app/summary/summary.html',
				controller: 'SummaryCtrl',
				controllerAs: 'summary',
				resolve: {
					summary: ['Data', '$route',
						function(data, $route) {
							var res = {};
							var params = $route.current.params;
							return data.runList({
								browser: params.browser,
								pagename: params.pagename
							}).then(function(list) {
								res.runList = list;
								params.time = params.time || list[0].time;
								return data.runData({
									browser: params.browser,
									pagename: params.pagename,
									time: params.time
								});
							}).then(function(data) {
								res.data = data;
							}).then(function() {
								return res;
							});
						}
					]
				}
			});
		}
	])
	.controller('SummaryCtrl', ['$routeParams', 'summary',
		function($routeParams, summary) {
			this.runList = summary.runList;
			this.data = summary.data;
		}
	]);