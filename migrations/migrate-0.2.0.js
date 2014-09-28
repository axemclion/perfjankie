// Migrating from 0.1.x to 0.2.0

var Q = require('q');

var utility = require('./utility');

module.exports = function(oldDb, newDb, config) {
	var log = config.log;

	return utility.forEachDoc(oldDb, newDb, function(doc) {
		if (doc.type !== 'perfData') {
			return null;
		}
		delete doc._id;
		delete doc._rev;
		var metrics = {};

		for (var key in doc.data) {
			var d = doc.data[key];
			doc.data[key] = d.value;
		}
		doc.url = null;
		doc.browser = doc.meta._browser || null;
		return doc;
	});
};