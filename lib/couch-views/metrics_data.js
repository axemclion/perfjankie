{
	_id: "_design/metrics_data",
	language: "javascript",
	views: {
		stats: {
			reduce: '_stats',
			map: function(doc) {
				if (doc.type === 'perfData') {
					for (var key in doc.data) {
						emit([doc.browser, doc.name, key, doc.time, doc.run], doc.data[key]);
					}
				}
			}
		}
	}
}