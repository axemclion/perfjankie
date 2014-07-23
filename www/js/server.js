SERVER = {
	metadata: {
		url: '../meta/_view/metrics?group=true',
		transformResponse: function(result, headersGetter) {
			var data = JSON.parse(result);
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
			return meta;
		}
	},
	stats: {
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
			}
		}
	}
}