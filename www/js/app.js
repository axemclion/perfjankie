(function() {
	var app = angular.module('Perfjankie', ['Backend']);

	app.controller('MainController', ['$scope', '$location', 'Backend',
		function($scope, $location, Backend) {
			$scope.selected = Backend.selected;
			$scope.$watch('selected', function(selected, old, scope) {
				if (!selected.browser || !selected.component || !selected.metric) {
					return;
				}
				scope.$broadcast('selected', selected);
				window.setTimeout(function() {
					window.location.hash = "";
					$location.search({
						component: selected.component,
						browser: selected.browser,
						metric: selected.metric
					})
				}, 1);
			}, true);
		}
	]);

	app.controller('ComponentsController', ['$scope', 'Backend',
		function($scope, Backend) {
			$scope.metadata = Backend.metadata;
			$scope.selected = Backend.selected;
			$scope.change = function(component) {
				Backend.selected.component = component;
				Backend.pickOne('browser');
				return false;
			}
		}
	]);

	app.controller('BrowsersController', ['$scope', 'Backend',
		function($scope, Backend) {
			$scope.metadata = Backend.metadata;
			$scope.selected = Backend.selected;
			$scope.change = function(browser) {
				Backend.selected.browser = browser;
				Backend.pickOne('metric');
				return false;
			}
		}
	]);

	app.controller('MetricsController', ['$scope', 'Backend',
		function($scope, Backend) {
			$scope.$on('selected', function(e, selected) {
				var meta = Backend.metadata;
				var common = ['ExpensiveEventHandlers', 'RecalculateStyles_avg', 'mean_frame_time'];
				var groups = {
					Common: {}
				};
				angular.forEach(common, function(metric) {
					groups['Common'][metric] = {
						key: metric
					};
				});

				angular.forEach(meta[selected.component][selected.browser], function(metric) {
					var group = metric.source;
					metric._group = group;
					if (typeof groups[group] === 'undefined') {
						groups[group] = {};
					}

					groups[group][metric.key] = metric;
				});
				e.currentScope.groups = groups;
			});
		}
	]);

	app.controller('SearchController', ['$scope', 'Backend', '$filter',
		function($scope, Backend, $filter) {
			$scope.change = function(metric) {
				$scope.selected.search = "";
				$scope.selected.metric = metric;
				return false;
			}
			$scope.$on('selected', function(e, selected) {
				var metrics = [];
				angular.forEach(Backend.metadata[selected.component][selected.browser], function(val) {
					val.display = $filter('formatMetric')(val.key);
					metrics.push(val);
				});
				e.currentScope.metrics = metrics;
			}, true);
		}
	]);

	app.controller('ChartController', ['$scope', 'Backend',
		function($scope, Backend) {
			$scope.loading = true;
			$scope.$on('selected', function(e, selected) {
				var scope = e.currentScope;
				if (selected.error) {
					scope.error = "Could not load metadata";
					return;
				}

				Backend.getStats().then(function(data) {
					scope.error = scope.loading = null;
					$('#chartDiv').empty();
					window.setTimeout(function() {
						try {
							drawGraph(data, "");
						} catch (e) {
							scope.error = 'Error drawing graph - ' + e.message + '. Specified data points were ' + data[0].length;
							scope.$digest();
						}
					}, 1);
				}, function(err) {
					scope.error = err;
				}, function() {
					scope.loading = true;
				});
			}, true);
		}
	])

	app.filter('formatMetric', function() {
		return function(metric) {
			if (metric) {
				return metric
					.replace(/_/g, ' ')
					.replace(/avg/, '(avg)').replace(/max/, '(max)').replace(/count/, '(count)');
			}
		}
	});
}());