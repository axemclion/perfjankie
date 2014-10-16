angular
	.module('Endpoints', [])
	.factory('Resource', ['$http', '$q',
		function($http, $q) {
			var server = {
				'/pagelist': function() {
					return $http.get('../metadata/_view/pagelist?group=true', {
						transformResponse: function(data, headersGetter) {
							var result = {};
							angular.forEach(JSON.parse(data).rows, function(row) {
								var suite = row.key[0],
									pagename = row.key[1],
									browser = row.key[2] || 'unknown',
									runCount = row.value;

								if (typeof result[suite] === 'undefined') {
									result[suite] = {};
								}
								if (typeof result[suite][pagename] === 'undefined') {
									result[suite][pagename] = [];
								}
								result[suite][pagename].push({
									browser: browser,
									runCount: runCount
								});
							});
							return result;
						}
					});
				},
				'/all-metrics': function() {
					return $q.when({
						data: window.METRICS_LIST
					});
				},
				'/summary': function(opts) {
					return fetch('/all-metrics').then(function(metricsList) {
						var count = 0;
						for (var key in metricsList) {
							if (metricsList.hasOwnProperty(key)) {
								count++;
							}
							count += metricsList[key].stats ? metricsList[key].stats.length : 0;
						}
						return $http.get('../data/_view/summary', {
							params: {
								endkey: JSON.stringify([opts.browser, opts.pagename, null]),
								startkey: JSON.stringify([opts.browser, opts.pagename, {}]),
								group: true,
								limit: count,
								descending: true
							},
							transformResponse: function(result, headersGetter) {
								var data = JSON.parse(result);
								var res = {
									url: data.rows[0].key[5],
									commit: data.rows[0].key[3]
								};
								angular.forEach(data.rows, function(obj, index) {
									res[obj.key[4]] = obj.value;
								});
								return res;
							}
						});
					});
				},
				'/metrics-data': function(opts) {
					var config = {
						params: {
							startkey: JSON.stringify([opts.browser, opts.pagename, opts.metric, null]),
							endkey: JSON.stringify([opts.browser, opts.pagename, opts.metric, {}]),
							group: true
						},
						transformResponse: function(result, headersGetter) {
							var data = JSON.parse(result);
							angular.forEach(data.rows, function(obj, index) {
								obj.label = obj.key[4];
								obj.key = obj.key[3];
							});
							return data.rows;
						}
					};
					var limit = parseInt(opts.limit, 10);
					if (!isNaN(limit)) {
						config.params.limit = limit;
					}
					return $http.get('../data/_view/metrics', config);
				}
			};

			var fetch = function(url, params) {
				return server[url](params).then(function(resp) {
					return resp.data;
				});
			};

			return fetch;
		}
	]);