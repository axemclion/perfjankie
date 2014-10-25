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
			}

			var link = function(scope, element, attrs) {
				scope.$watch('data', function(val) {
					if (!val) {
						return;
					}
					var tiles = [];
					metricsList().then(function(metricsList) {
						angular.forEach(['framesPerSec', 'firstPaint', 'ExpensivePaints', 'NodePerLayout_avg', 'ExpensiveEventHandlers', ], function(metric) {
							if (typeof val[metric] === 'object') {
								tiles.push({
									metric: metric,
									unit: metricsList[metric].unit,
									value: val[metric].value.sum / val[metric].value.count
								});
							}
						});
						scope.tiles = tiles.slice(0, 4);
					});
				});
			};

			return {
				restrict: 'E',
				transclude: true,
				scope: {
					data: "="
				},
				link: link,
				templateUrl: 'app/summary/tiles.html'
			};
		}
	]);