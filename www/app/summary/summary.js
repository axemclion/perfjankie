angular
	.module('summary', ['ngRoute', 'Backend'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/summary', {
				templateUrl: 'app/summary/summary.html',
				controller: 'SummaryCtrl',
				controllerAs: 'summary',
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
	.controller('SummaryCtrl', ['$routeParams', 'Data', 'MetricsList',
		function($routeParams, Data, metricsList) {
			var self = this;

			this.getSummary = function() {
				self.loading = true;
				Data.summary({
					browser: $routeParams.browser,
					pagename: $routeParams.pagename
				}).then(this.setData, function(err) {
					self.err = err;
				}).finally(function() {
					self.loading = false;
				});
			};

			var tiles = ['mean_frame_time', 'firstPaint', 'ExpensiveEventHandlers', ['Layers', 'sum']];

			this.setData = function(data) {
				self.tiles = [];
				angular.forEach(tiles, function(tile) {
					var metric = (typeof tile === 'string' ? tile : tile[0]);
					if (typeof data[metric] === 'undefined') {
						return;
					}
					var record = metricsList[metric] || {};
					record.metric = metric;
					record.value = (typeof tile === 'string' ? data[metric].sum / data[metric].count : data[metric][tile[1]]);
					self.tiles.push(record);
				});
				self.meta = {
					url: data.url,
					run: data.commit,
					time: data
				}
			};

			this.getSummary();
		}
	]);