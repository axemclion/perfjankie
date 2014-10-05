angular
	.module('graphs', [])
	.directive('metricsDetailGraph', function() {
		function link(scope, element, attrs) {
			var id = 'metricDetails' + Math.floor(Math.random() * 10000);
			var canvas = element.children('div');
			canvas.attr('id', id);
			prepareCanvas(canvas);

			scope.$watch('data', function(val) {
				if (!val) {
					return;
				} else {
					try {
						drawGraph(id, prepareData(val), scope.unit);
					} catch (e) {
						scope.error = true;
					}
				}
			});
		}

		function prepareCanvas(canvas) {
			var pos = canvas.position();
			canvas.height(window.innerHeight - pos.top - 100);
			canvas.width('100%');
		}

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
						color: '#333',
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

		return {
			link: link,
			restrict: 'E',
			scope: {
				data: "=",
				unit: "="
			},
			template: '<span class="graph-error" ng-show="error"><em><span class="icon-attention"></span>Error</em>Could not plot graph due to error in data</span><div></div>'
		};
	});