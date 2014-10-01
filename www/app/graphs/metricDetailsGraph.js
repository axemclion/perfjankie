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
					drawGraph(id, val);
				}
			});
		}

		function prepareCanvas(canvas) {
			var pos = canvas.position();
			canvas.height(window.innerHeight - pos.top - 100);
			canvas.width('100%');
		}

		function drawGraph(el, result, unit) {
			$.jqplot(el, [result.data, result.min, result.max], {
				// Turns on animatino for all series in this plot.
				animate: true,
				// Will animate plot on calls to plot1.replot({resetAxes:true})
				animateReplot: true,
				series: [{
					lineWidth: 1,
					color: "rgb(67, 142, 185)",
					markerOptions: {
						size: 2,
						style: "circle"
					}
				}, {
					show: false
				}, {
					show: false
				}],
				axesDefaults: {
					pad: 1.2
				},
				seriesDefaults: {
					rendererOptions: {
						smooth: true
					}
				},
				fillBetween: {
					series1: 1,
					series2: 2,
					color: "rgba(67, 142, 185, 0.2)",
					baseSeries: 0,
					fill: true
				},
				axes: {
					// These options will set up the x axis like a category axis.
					xaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						label: 'Runs',
						labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
						tickRenderer: $.jqplot.CanvasAxisTickRenderer,
						tickOptions: {
							angle: -90,
							mark: 'inside',
							showMark: true,
							showGridline: true,
							markSize: 4,
							show: true,
							showLabel: true,
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
				data: "="
			},
			template: '<div></div>'
		};
	});