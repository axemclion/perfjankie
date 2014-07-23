(function() {
	var app = angular.module('Backend', []);

	app.factory('Backend', ['$q', '$http', '$location',
		function($q, $http, $location) {
			var pickOne = function(prop) {
				function pick(obj) {
					var res = null;
					for (var key in obj) {
						res = key;
						break;
					}
					return res;
				}
				switch (prop) {
					case 'component':
						backend.selected.component = pick(backend.metadata);
					case 'browser':
						backend.selected.browser = pick(backend.metadata[backend.selected.component]);
					case 'metric':
						backend.selected.metric = backend.metadata[backend.selected.component][backend.selected.browser][0].key;
				}
			};

			var getStats = function() {
				var dfd = $q.defer();
				dfd.notify();
				var browser = backend.selected.browser,
					component = backend.selected.component,
					metric = backend.selected.metric;
				if (!component || !browser || !metric) {
					dfd.reject('Component, Browser or Metric are not defined');
				} else {
					$http.get(SERVER.stats.url, {
						transformResponse: SERVER.stats.transformResponse,
						params: {
							startkey: JSON.stringify([browser, component, metric]),
							endkey: JSON.stringify([browser, component, metric, {}]),
							group: true
						}
					}).success(function(data) {
						var result = [],
							minBand = [],
							maxBand = [];
						angular.forEach(data.rows, function(obj, index) {
							var key = JSON.stringify(obj.key[4]).replace(/\"/g, '');
							result.push([key, obj.value.sum / obj.value.count]);
							minBand.push([key, obj.value.min]);
							maxBand.push([key, obj.value.max]);
						});
						dfd.resolve([result, minBand, maxBand]);
					}).error(function(err) {
						dfd.reject('Could not get data for ' + component + ' ' + browser + ' ' + metric);
					});
				}
				return dfd.promise;
			};

			var fetchMetadata = function() {
				$http.get(SERVER.metadata.url, {
					transformResponse: SERVER.metadata.transformResponse
				}).success(function(data) {
					var meta = {};
					angular.forEach(data.rows, function(row) {
						if (!angular.isArray(row.key)) {
							deferred.resolve({});
						} else {
							var component = row.key[1].component;
							var browser = row.key[0];
							var metric = row.key[1];
							if (typeof meta[component] === 'undefined') {
								meta[component] = {};
							}

							if (typeof meta[component][browser] === 'undefined') {
								meta[component][browser] = [];
							}
							meta[component][browser].push(metric);
						}
					});
					angular.copy(meta, backend.metadata);
					var location = $location.search();
					if (location.component && location.browser && location.metric) {
						backend.selected.component = location.component;
						backend.selected.metric = location.metric;
						backend.selected.browser = location.browser;
					} else {
						pickOne('component');
						pickOne('browser');
						pickOne('metric');
					}
				}).error(function(e) {
					backend.selected.error = "Could not fetch metadata " + e;
				});
			};

			fetchMetadata();

			var backend = {
				metadata: {},
				selected: {},
				pickOne: pickOne,
				getStats: getStats
			};

			return backend;
		}
	]);
}());