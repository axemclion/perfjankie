{
	_id: "_design/data",
	language: "javascript",
	views: {
		metrics: {
			reduce: "_stats",
			map: function(doc) {
				if (doc.type === 'perfData') {
					for (var key in doc.data) {
						if (parseFloat(doc.data[key].value)) {
							emit([doc.meta._browserName, doc.name, key, doc.time, doc.run], doc.data[key].value);
						}
					}
				}
			}
		},
		data: {
			map: function(doc) {
				if (doc.type === 'perfData') {
					emit(doc.name, doc.data);
				}
			}
		}
	}
}