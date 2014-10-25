angular
	.module('paintCycleGraph', [])
	.directive('pjPaintCycleGraph', function() {
		var id = 'paintCycle' + Math.floor(Math.random() * 10000);

		function prepareData(data) {
			// TODO - pickout loading, scripting, rendering, paint
			var paints = [];
			angular.forEach(['Layout', 'CompositeLayers', 'Paint', 'RecalculateStyles'], function(key) {
				paints.push([key, data[key].value.sum]);
			});
			return paints;
		}

		function drawGraph(el, data) {
			$.jqplot(el, [data], {
				seriesColors: ['#7AA9E5', '#EFC453', '#9A7EE6', '#71B363'],
				seriesDefaults: {
					renderer: $.jqplot.PieRenderer,
					rendererOptions: {
						showDataLabels: true,
						dataLabels: ['value'],
						dataLabelFormatString: '%d ms',
						highlightMouseOver: true
					}
				},
				grid: {
					shadow: false,
					borderWidth: 0
				},
				legend: {
					show: true,
					location: 'e'
				}
			});
		}

		function link(scope, element, attrs) {
			scope.$watch('data', function(val) {
				if (val) {
					try {
						drawGraph(id, prepareData(val));
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
				data: "="
			},
			template: '<div ng-hide="error" id="' + id + '"></div><div ng-transclude ng-show="error"></div>'
		};
	});