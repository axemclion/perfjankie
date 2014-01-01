{
	_id: "_design/meta",
	language: "javascript",
	views: {
		suites: {
			reduce: function(key, values, rereduce) {
				return null;
			},
			map: function(doc) {
				if (doc.type === 'perfData') {
					emit(doc.suite, null)
				}
			}
		},
		metrics: {
			reduce: function(key, values, rereduce) {
				return null;
			},
			map: function(doc) {
				for (var key in doc.data) {
					if (parseFloat(doc.data[key]))
						emit([doc.meta._browserName, key], null);
				}
			}
		},
		names: {
			reduce: function() {
				return null;
			},
			map: function(doc) {
				if (doc.type === 'perfData') {
					emit(doc.name, null);
				}
			}
		}
	}
}