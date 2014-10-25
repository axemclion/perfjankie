angular
	.module('metricsGraphDetails', [])
	.directive('pjMetricsDetailsGraph', function() {
		function prepareData(val) {
			var result = {
				series: [],
				max: [],
				min: [],
				xaxis: {}
			};
			angular.forEach(val, function(p) {
				var xaxis = [p.label, p.key];
				result.series.push([p.key, p.value.sum / p.value.count, p.value.min, p.value.max]);
				result.min.push([p.key, p.value.min]);
				result.max.push([p.key, p.value.max]);
				result.xaxis[p.key] = p.label;
			});
			return result;
		}

		function drawGraph(el, data, unit) {
			$.jqplot(el, [data.series, data.min, data.max], {
				fillBetween: {
					series1: 1,
					series2: 2,
					color: "rgba(67, 142, 185, 0.2)",
					baseSeries: 0,
					fill: true
				},
				series: [{
					show: true,
					shadow: false,
					breakOnNull: true,
					rendererOptions: {
						smooth: false,
					},
					trendline: {
						show: true,
						shadow: false,
						color: '#666',
						lineWidth: 2,
						linePattern: 'dashed',
						label: 'trend'
					}
				}],
				seriesDefaults: {
					show: false,
					rendererOptions: {
						smooth: true
					}
				},
				axes: {
					xaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						label: 'Runs',
						labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
						tickRenderer: $.jqplot.CanvasAxisTickRenderer,
						rendererOptions: {
							sortMergedLabels: false
						},
						tickOptions: {
							mark: 'cross',
							showMark: true,
							showGridline: true,
							markSize: 5,
							angle: -90,
							show: true,
							showLabel: true,
							formatter: function(formatString, value) {
								return data.xaxis[value];
							}
						},
						showTicks: true, // wether or not to show the tick labels,
						showTickMarks: true,
					},
					yaxis: {
						tickOptions: {},
						rendererOptions: {
							forceTickAt0: false
						},
						label: unit || 'Y AXIS',
						labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
						tickRenderer: $.jqplot.CanvasAxisTickRenderer
					}
				},
				grid: {
					shadow: false,
					borderWidth: 0
				},
				highlighter: {
					show: true,
					showLabel: true,
					tooltipAxes: 'y',
					sizeAdjust: 7.5,
					tooltipLocation: 'ne'
				}
			});
		}

		var id = 'metricDetails' + Math.floor(Math.random() * 10000);

		function link(scope, element, attrs) {
			scope.$watch('data', function(val) {
				if (val) {
					try {
						drawGraph(id, prepareData(val), scope.unit);
					} catch (e) {
						scope.error = e;
					}
				}
			});
		}

		return {
			link: link,
			restrict: 'E',
			transclude: true,
			scope: {
				data: "=",
				unit: "="
			},
			template: '<div ng-hide="error" id="' + id + '"></div><div ng-transclude ng-show="error"></div>'
		};
	});