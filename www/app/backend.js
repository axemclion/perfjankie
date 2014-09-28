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
					return $http(opts);
				};
			}

			return {
				pagelist: get(ENDPOINTS.pagelist),
				getAllMetrics: get(ENDPOINTS.getAllMetrics)
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