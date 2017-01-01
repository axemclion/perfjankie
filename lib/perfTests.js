module.exports = function(config) {
	var Q = require('q'),
		dfd = Q.defer();

	if (config.couch.onlyUpdateSite) {
		dfd.resolve();
	} else {

        var browserPerf = config.browserPerf || require('browser-perf'),
            log = config.log;
		const perfConfig = {
            browsers: config.browsers,
            selenium: config.selenium,
            debugBrowser: config.debug,
            preScript: config.preScript,
            preScriptFile: config.preScriptFile,
            actions: config.actions,
            metrics: config.metrics,
            SAUCE_ACCESSKEY: config.SAUCE_ACCESSKEY || undefined,
            SAUCE_USERNAME: config.SAUCE_USERNAME || undefined,
            BROWSERSTACK_USERNAME: config.BROWSERSTACK_USERNAME || undefined,
            BROWSERSTACK_KEY: config.BROWSERSTACK_KEY || undefined
        };
        if (config.browserPerfRunner) {
            const browserPerfRunner = new browserPerf.runner(perfConfig);
            browserPerfRunner.start(config.browserPerfRunner.sessionId, () => {
                log.debug('Starting Browser Perf Runner');
                if (typeof config.browserPerfRunner.onStart==='function') {
                    var doneCallback = function (err, results) {
                        if (err) {
                            dfd.reject(err);
                        } else {
                            log.debug('Got Browser Perf Runner results back, now saving the results');
                            results._browserName  = config.browserPerfRunner.browserName;
                            results._url  = config.url;
                            dfd.resolve([results]);
                        }
                    };
                    config.browserPerfRunner.onStart.apply({}, [browserPerfRunner, doneCallback]);
				} else {
                    log.fatal('Browser Perf Runner onStart callback is undefined');
                }
            });
        } else {
			log.debug('Starting Browser Perf');
			browserPerf(config.url, function (err, results) {
				if (err) {
					dfd.reject(err);
				} else {
					log.debug('Got Browser Perf results back, now saving the results');
					dfd.resolve(results);
				}
			}, perfConfig);
		}
	}
	return dfd.promise;
};
