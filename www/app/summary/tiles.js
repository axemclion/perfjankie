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
					angular.forEach(['frames_per_sec', 'framesPerSec_raf', 'firstPaint', 'ExpensivePaints', 'NodePerLayout_avg', 'ExpensiveEventHandlers', ], function(metric) {
						if (typeof val[metric] === 'object') {
							tiles.push({
								metric: metric,
								unit: metricsList[metric].unit,
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