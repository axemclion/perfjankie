module.exports = {
	config: function(config) {
		config = config || {};
		var options = {
			"url": "http://localhost:9000/test1.html",
			//"url": "https://axemclion.cloudant.com/",
			"name": "Page - Test1",
			"suite": 'Suite1',
			"time": new Date().getTime(),
			"run": 'commit#' + new Date().getMilliseconds(),
			"browsers": ['chrome', 'firefox'],
			"selenium": {
				hostname: "localhost",
				port: 4444
			},
			"log": config.log || require('bunyan').createLogger({
				name: 'test',
				src: true,
				level: 'debug',
				//stream: process.stdout,
				streams: [{
					path: 'test.log'
				}]
			}),
			"couch": {
				server: 'http://localhost:5984',
				database: 'perfjankie-test',
				updateSite: true,
				onlyUpdateSite: false
			}
		};

		var extend = function(options, config) {
			for (var key in config) {
				if (typeof options[key] === 'object' && typeof config[key] === 'object') {
					options[key] = extend(options[key], config[key]);
				} else {
					options[key] = config[key];
				}
			}
			return options;
		};

		return extend(options, config || {});
	}
};