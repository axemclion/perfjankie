module.exports = function(config) {
	var options = require('./options')(config);

	var log = options.log;
	var browserPerf = config.browserPerf || require('browser-perf'),
		couchData = config.couchData || require('./couchData');

	log.info('Starting PerfJankie');

	var updateSite = function(err, results) {
		if (config.couch.updateSite) {
			var couchSite = config.couchSite || require('./couchSite');
			couchSite(options, function(err, res) {
				if (err) {
					// TODO - Handle site not updated error
					log.error('Error Updating Site', err);
				}

				require('./couchViews')(config, options.callback);
			});
		} else {
			options.callback(err, results);
		}
	};

	if (config.couch.onlyUpdateSite) {
		updateSite(null, []);
	} else {
		browserPerf(config.url, function(err, results) {
			if (err) {
				// TODO - do something with errors when running performance tests
				log.error('Error running browser Perf', err);
			}

			couchData(options, results, function(err, results) {
				if (err) {
					// TODO - do something if saving to couchDB fails
					log.error('Error when uploading data', err);
				}
				updateSite(err, results);
			});
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
};