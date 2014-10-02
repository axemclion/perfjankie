window.ENDPOINTS = {
	metricsData: {
		url: '../data/_view/metrics',
		transformResponse: function(result, headersGetter) {
			var data = JSON.parse(result);
			angular.forEach(data.rows, function(obj, index) {
				obj.label = obj.key[4];
				obj.key = obj.key[3];
			});
			return data.rows;
		}
	},
	pagelist: {
		url: '../metadata/_view/pagelist?group=true',
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
	}
};