module.exports = function(config) {
	var options = require('./options')(config);

	var log = options.log;
	var browserPerf = config.browserPerf || require('browser-perf'),
		couchData = config.couchData || require('./couchData');

	log.info('Starting PerfJankie');

	browserPerf(config.url, function(err, results) {
		// TODO - do something with errors when running performance tests
		couchData(options, results, function(err, results) {
			// TODO - do something if saving to couchDB fails
			if (config.couch.updateSite) {
				var couchSite = config.couchSite || require('./couchSite');
				couchSite(options, function(err, res) {
					// TODO - Handle site not updated error
					require('./couchViews')(config, options.callback);
				});
			} else {
				options.callback(err, results);
			}
		});
	}, {
		browsers: config.browsers,
		selenium: config.selenium,
		debug: config.debug,
		log: config.log
	});
};