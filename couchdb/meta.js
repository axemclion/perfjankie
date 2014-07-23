{
	_id: "_design/meta",
	language: "javascript",
	views: {
		metrics: {
			reduce: function(key, values, rereduce) {
				return null;
			},
			map: function(doc) {
				for (var key in doc.data) {
					var data = doc.data[key];
					if (parseFloat(data.value))
						emit([doc.meta._browserName, {
							key: key,
							unit: data.unit,
							category: data.category,
							source: data.source,
							tags: data.tags,
							component: doc.name
						}], null);
				}
			}
		}
	}
}