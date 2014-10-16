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
		doc.url = null;
		doc.browser = doc.meta._browserName || null;

		for (var key in doc.data) {
			doc.data[key] = doc.data[key].value;
		}

		doc.data[events[0]] = 0;
		for (var i = 1; i < events.length; i++) {
			if (typeof doc.data[events[i]] === 'undefined') {
				doc.data[events[i]] = 0;
			}
			doc.data[events[i]] = doc.data[events[i]] + doc.data[events[i - 1]];
		}

		return doc;
	});
};

var events = [
	'navigationStart',
	'unloadEventStart',
	'unloadEventEnd',
	'redirectStart',
	'redirectEnd',
	'fetchStart',
	'domainLookupStart',
	'domainLookupEnd',
	'connectStart',
	'connectEnd',
	'secureConnectionStart',
	'requestStart',
	'responseStart',
	'domLoading',
	'domInteractive',
	'domContentLoadedEventStart',
	'domContentLoadedEventEnd',
	'domComplete',
	'loadEventStart',
	'loadEventEnd'
];