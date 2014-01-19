module.exports = function(config) {
	var Q = require('q'),
		dfd = Q.defer();

	if (config.couch.onlyUpdateSite) {
		dfd.resolve();
	} else {
		var browserPerf = config.browserPerf || require('browser-perf'),
			couchData = config.couchData || require('./couchData'),
			log = config.log;

		log.debug('Starting Browser Perf');
		browserPerf(config.url, function(err, results) {
			if (err) {
				dfd.reject(err);
			} else {
				log.debug('Got Browser Perf results back, now saving the results');
				couchData(config, results).then(dfd.resolve, dfd.reject);
			}
		}, {
			browsers: config.browsers,
			selenium: config.selenium,
			debug: config.debug,
			log: config.log,
			SAUCE_ACCESSKEY: config.SAUCE_ACCESSKEY || undefined,
			SAUCE_USERNAME: config.SAUCE_USERNAME || undefined,
			BROWSERSTACK_USERNAME: config.BROWSERSTACK_USERNAME || undefined,
			BROWSERSTACK_KEY: config.BROWSERSTACK_KEY || undefined
		});
	}
	return dfd.promise;
};