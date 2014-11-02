if (typeof window.DB_BASE !== 'string') {
	window.DB_BASE = '..';
}

angular
	.module('Endpoints', [])
	.factory('Resource', ['$http', '$q',
		function($http, $q) {
			function rowsToObj(row, keys, val) {
				var res = {};
				res[val] = row.value;
				angular.forEach(keys, function(key, i) {
					res[key] = row.key[i];
				});
				return res;
			}

			var server = {
				'/pagelist': function() {
					return $http.get(window.DB_BASE + '/pagelist/_view/pages?group=true').then(function(resp) {
						var result = {};
						angular.forEach(resp.data.rows, function(row) {
							var res = rowsToObj(row, ['suite', 'pagename', 'browser'], 'runCount');
							result[res.suite] = result[res.suite] || {};
							result[res.suite][res.pagename] = result[res.suite][res.pagename] || [];
							result[res.suite][res.pagename].push({
								browser: res.browser,
								runCount: res.runCount
							});
						});
						return result;
					});
				},
				'/all-metrics': function() {
					return $q.when(window.METRICS_LIST);
				},
				'/runList': function(opts) {
					return $http.get(window.DB_BASE + '/runs/_view/list', {
						params: {
							endkey: JSON.stringify([opts.browser, opts.pagename, null]),
							startkey: JSON.stringify([opts.browser, opts.pagename, {}]),
							group: true,
							descending: true
						}
					}).then(function(resp) {
						var res = [];
						angular.forEach(resp.data.rows, function(row) {
							res.push(rowsToObj(row, ['browser', 'pagename', 'time', 'run'], 'runCount'));
						});
						return res;
					});
				},
				'/runData': function(opts) {
					opts.time = parseInt(opts.time, 10);
					return $http.get(window.DB_BASE + '/runs/_view/data', {
						params: {
							startkey: JSON.stringify([opts.browser, opts.pagename, opts.time, null]),
							endkey: JSON.stringify([opts.browser, opts.pagename, opts.time, {}]),
							group: true
						}
					}).then(function(resp) {
						var res = {};
						angular.forEach(resp.data.rows, function(row) {
							var obj = rowsToObj(row, ['browser', 'pagename', 'time', 'run', 'metric'], 'value');
							res[obj.metric] = obj.value;
						});
						return res;
					});
				},
				'/metrics-data': function(opts) {
					var config = {
						params: {
							startkey: JSON.stringify([opts.browser, opts.pagename, opts.metric, null]),
							endkey: JSON.stringify([opts.browser, opts.pagename, opts.metric, {}]),
							group: true
						}
					};
					var limit = parseInt(opts.limit, 10);
					if (!isNaN(limit)) {
						config.params.limit = limit;
					}
					return $http.get(window.DB_BASE + '/metrics_data/_view/stats', config).then(function(resp) {
						var res = [];
						angular.forEach(resp.data.rows, function(obj, index) {
							obj.label = obj.key[4];
							obj.key = obj.key[3];
							res.push(obj);
						});
						return res;
					});
				}
			};

			var fetch = function(url, params) {
				return server[url](params);
			};

			return fetch;
		}
	]);