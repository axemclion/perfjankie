{
	_id: "_design/runs",
	language: "javascript",
	views: {
		list: {
			map: function(doc) {
				emit([doc.browser, doc.name, doc.time, doc.run], null);
			},
			reduce: "_count"
		},
		data: {
			map: function(doc) {
				if (doc.type === 'perfData') {
					for (var key in doc.data) {
						if (typeof doc.data[key] === 'number') {
							emit([doc.browser, doc.name, doc.time, doc.run, key], doc.data[key]);
						}
					}
				}
			},
			reduce: "_stats"
		}
	}
}