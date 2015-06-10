angular
	.module('networkTiming', [])
	.directive('pjNetworkTimingGraph', function() {
		var ticks = ['onLoad', 'Processing', 'Response', 'Request', 'TCP', 'DNS', 'AppCache', 'Unload', 'Start/Redirect'];
		var events = [
			['loadEventStart', 'loadEventEnd'],
			['domLoading', 'domComplete'],
			['responseStart', 'responseEnd'],
			['requestStart', 'responseStart'],
			['connectStart', 'connectEnd'],
			['domainLookupStart', 'domainLookupEnd'],
			['fetchStart', 'domainLookupStart'],
			['unloadStart', 'unloadEnd'],
			['redirectStart', 'redirectStop'],
		];

		function prepareData(val) {
			var series = [
				[],
				[]
			];
			var initial = val['navigationStart'].sum / val['navigationStart'].count;
			var prev = initial;
			for (var i = 0; i < events.length; i++) {
				var start = val[events[i][0]];
				var end = val[events[i][1]];
				if (start && start.sum > 0) {
					start = start.sum / start.count;
				} else {
					start = (i > 0 ? series[0][i - 1] + initial : initial);
				}
				if (end && end.sum > 0) {
					end = end.sum / end.count;
				} else {
					end = start;
				}
				series[0].push(start - initial);
				series[1].push(end - initial);
			}
			return series;
		}

		function drawGraph(el, series) {
			$.jqplot(el, series, {
				stackSeries: true,
				seriesDefaults: {
					renderer: $.jqplot.BarRenderer,
					rendererOptions: {
						barDirection: 'horizontal',
						barPadding: 0,
						barMargin: 0,
						shadowDepth: 0,
						stacked: true
					}
				},
				series: [{
					color: 'rgba(0,0,0,0)'
				}],
				axes: {
					yaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						ticks: ticks,
						tickRenderer: $.jqplot.CanvasAxisTickRenderer
					},
				},
				grid: {
					shadow: false,
					borderWidth: 0
				},
			});
		}

		var id = 'networkTimings' + Math.floor(Math.random() * 10000);

		function link(scope, element, attrs) {
			scope.$watch('data', function(val) {
				if (val && !angular.equals(val, {})) {
					drawGraph(id, prepareData(val));
				}
			});
		}

		return {
			restrict: 'E',
			transclude: true,
			scope: {
				data: "="
			},
			link: link,
			template: '<div ng-hide="error" id="' + id + '"></div>'
		};
	});