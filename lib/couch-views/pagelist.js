{
	_id: "_design/pagelist",
	language: "javascript",
	views: {
		pages: {
			reduce: "_count",
			map: function(doc) {
				emit([doc.suite, doc.name, doc.meta._browserName], null);
			}
		}
	}
}