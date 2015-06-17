// Migrating to browser-perf@1.3.0. Names of some metrics have changed

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

		doc.data.meanFrameTime_raf = doc.data.meanFrameTime;

		var metrics = new Metrics(doc.data);

		metrics.addMetric('loadTime', 'loadEventEnd', 'fetchStart');
		metrics.addMetric('domReadyTime', 'domComplete', 'domInteractive');
		metrics.addMetric('readyStart', 'fetchStart', 'navigationStart');
		metrics.addMetric('redirectTime', 'redirectEnd', 'redirectStart');
		metrics.addMetric('appcacheTime', 'domainLookupStart', 'fetchStart');
		metrics.addMetric('unloadEventTime', 'unloadEventEnd', 'unloadEventStart');
		metrics.addMetric('domainLookupTime', 'domainLookupEnd', 'domainLookupStart');
		metrics.addMetric('connectTime', 'connectEnd', 'connectStart');
		metrics.addMetric('requestTime', 'responseEnd', 'requestStart');
		metrics.addMetric('initDomTreeTime', 'domInteractive', 'responseEnd');
		metrics.addMetric('loadEventTime', 'loadEventEnd', 'loadEventStart');

		return doc;
	});
};

function Metrics(metrics) {
	this.timing = metrics;
}

Metrics.prototype.addMetric = function(prop, a, b) {
	if (typeof this.timing[a] === 'number' && typeof this.timing[b] === 'number') {
		this.timing[prop] = this.timing[a] - this.timing[b];
	}
}