angular
	.module('Backend', ['Endpoints'])
	.factory('Data', ['Resource',
		function(resource) {
			return {
				pagelist: function() {
					return resource('/pagelist')
				},
				getAllMetrics: function() {
					return resource('/all-metrics');
				},
				metricsData: function(opts) {
					return resource('/metrics-data', {
						browser: opts.browser,
						pagename: opts.pagename,
						metric: opts.metric,
						limit: opts.limit
					});
				},
				summary: function(opts) {
					return resource('/summary', {
						browser: opts.browser,
						pagename: opts.pagename
					});
				}
			};
		}
	]);