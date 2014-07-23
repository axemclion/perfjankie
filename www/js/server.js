SERVER = {
	metadata: {
		url: '../meta/_view/metrics?group=true',
		transformResponse: function(data, headersGetter) {
			return JSON.parse(data);
		}
	},
	stats: {
		url: '../data/_view/metrics',
		transformResponse: function(data, headersGetter) {
			return JSON.parse(data);
		}
	}
}