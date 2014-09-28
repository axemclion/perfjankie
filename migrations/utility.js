var Q = require('q');
var MAX_LIMIT = 53;

module.exports = {
	forEachDoc: function(oldDb, newDb, callback) {
		function processBatch(skip) {
			skip = skip || 0;
			var count = 0;
			return Q.ninvoke(oldDb, 'get', '_all_docs', {
				limit: MAX_LIMIT,
				skip: skip,
				include_docs: true
			}).then(function(docs) {
				count = docs[0].rows.length;
				return result = docs[0].rows.map(function(data) {
					return callback(data.doc);
				});
			}).then(function(results) {
				return Q.ninvoke(newDb, 'bulk', {
					docs: results.filter(function(val) {
						return val !== null;
					})
				}, {
					new_edits: true
				});
			}).then(function() {
				if (count >= MAX_LIMIT) {
					return processBatch(skip + MAX_LIMIT);
				} else {
					return Q();
				}
			});
		}

		return processBatch();
	}
}