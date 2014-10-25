angular
	.module('Backend', ['Endpoints'])
	.factory('Data', ['Resource',
		function(resource) {
			return {
				pagelist: function() {
					return resource('/pagelist');
				},
				runList: function(opts) {
					return resource('/runList', {
						browser: opts.browser,
						pagename: opts.pagename
					});
				},
				runData: function(opts) {
					return resource('/runData', {
						browser: opts.browser,
						pagename: opts.pagename,
						time: opts.time
					});
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
				}
			};
		}
	]);