angular
	.module('summaryTiles', ['Backend'])
	.directive('pjSummaryTiles', ['Data', '$q',
		function(data, $q) {
			var _metricsList;

			var metricsList = function() {
				if (_metricsList) {
					return $q.when(_metricsList);
				} else {
					return data.getAllMetrics().then(function(result) {
						return _metricsList = result;
					});
				}
			};

			var prepareData = function(val) {
				var tiles = [];
				return metricsList().then(function(metricsList) {
					function getMetricUnit(metric) {
						for (var i = 0; i < metricsList.length; i++) {
							if (metric === metricsList[i].name) {
								return metricsList[i].unit;
							}
							return '';
						}
					}

					angular.forEach(['frames_per_sec', 'framesPerSec_raf', 'firstPaint', 'ExpensivePaints', 'NodePerLayout_avg', 'ExpensiveEventHandlers', ], function(metric) {
						if (typeof val[metric] === 'object') {
							tiles.push({
								metric: metric,
								unit: getMetricUnit(metric),
								value: val[metric].sum / val[metric].count,
								link: metric
							});
						}
					});
					return tiles;
				});
			};

			return {
				restrict: 'E',
				transclude: true,
				scope: {
					data: "=",
					pagename: "=",
					browser: "="
				},
				link: function(scope, element, attrs) {
					scope.$watch('data', function(val) {
						if (!val) {
							return;
						}
						prepareData(val).then(function(res) {
							scope.tiles = res.slice(0, 4);
						});
					});
				},
				templateUrl: 'app/summary/tiles.tpl.html'
			};
		}
	]);