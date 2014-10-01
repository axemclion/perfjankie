angular
	.module('Backend', [])
	.factory('Metadata', ['$http',
		function($http) {
			function get(opts) {
				return function() {
					opts = opts || {};
					if (typeof opts === 'string') {
						opts = {
							url: opts
						};
					}
					return $http(opts).then(function(resp) {
						return resp.data;
					});
				};
			}

			return {
				pagelist: get(ENDPOINTS.pagelist),
				getAllMetrics: function() {
					return window.METRICS_LIST;
				}
			};
		}
	])
	.factory('Data', ['$http',
		function($http) {
			return {
				summary: function() {},
				metricsData: function(browser, pagename, metric) {
					return $http({
						url: ENDPOINTS.metricsData.url,
						params: {
							startkey: JSON.stringify([browser, pagename, metric, null]),
							endkey: JSON.stringify([browser, pagename, metric, {}]),
							group: true
						},
						transformResponse: ENDPOINTS.metricsData.transformResponse
					}).then(function(resp) {
						console.log(resp.data);
						return resp.data;
					});
				}
			};
		}
	]);