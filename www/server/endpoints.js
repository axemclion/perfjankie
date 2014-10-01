window.ENDPOINTS = {
	metricsData: {
		url: '../data/_view/metrics',
		transformResponse: function(result, headersGetter) {
			var data = JSON.parse(result);
			var result = [],
				minBand = [],
				maxBand = [];
			angular.forEach(data.rows, function(obj, index) {
				var key = JSON.stringify(obj.key[4]).replace(/\"/g, '');
				result.push([key, obj.value.sum / obj.value.count]);
				minBand.push([key, obj.value.min]);
				maxBand.push([key, obj.value.max]);
			});
			return {
				data: result,
				min: minBand,
				max: maxBand
			};
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