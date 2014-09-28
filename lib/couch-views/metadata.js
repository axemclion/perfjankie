{
	_id: "_design/metadata",
	language: "javascript",
	views: {
		pagelist: {
			reduce: "_count",
			map: function(doc) {
				emit([doc.suite, doc.name, doc.meta._browserName], null);
			}
		}
	}
}