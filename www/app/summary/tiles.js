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

			var getFramesPerSec = function(val, metrics) {
				var mft;
				// Iterate over each candidate to calculate FPS
				for (var i = 0; i < metrics.length; i++) {
					if (val[metrics[i]]) {
						mft = val[metrics[i]].sum / val[metrics[i]].count;
					}
					if (mft >= 10 && mft <= 60) {
						break;
					} else {
						mft = null;
					}
				}
				if (mft) {
					return {
						sum: 1000 / mft,
						count: 1
					};
				}
			};

			var prepareData = function(val) {
				var tiles = [];
				val.frames_per_sec = getFramesPerSec(val, ['mean_frame_time', 'meanFrameTime']);
				return metricsList().then(function(metricsList) {
					angular.forEach(['frames_per_sec', 'firstPaint', 'ExpensivePaints', 'NodePerLayout_avg', 'ExpensiveEventHandlers', ], function(metric) {
						if (typeof val[metric] === 'object') {
							tiles.push({
								metric: metric,
								unit: metricsList[metric].unit,
								value: val[metric].sum / val[metric].count,
								link: metric === 'frames_per_sec' ? 'meanFrameTime' : metric
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