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
				summary: function() {}
			};
		}
	]);