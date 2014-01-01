module.exports = {
	config: function(config) {
		var bunyan = require('bunyan'),
			bFormat = require('bunyan-format');

		var options = {
			"url": "http://localhost:9000/test1.html",
			"name": "Page - Test1",
			"suite": 'Suite1',
			"time": new Date().getTime(),
			"run": 'commit#' + new Date().getMilliseconds(),
			"browsers": ['chrome', 'firefox'],
			"selenium": {
				hostname: "localhost",
				port: 4444
			},
			"log": bunyan.createLogger({
				name: 'TEST',
				level: 'debug',
				stream: bFormat({
					outputMode: 'short'
				}),
			}),
			"couch": {
				server: 'http://localhost:5984',
				database: 'performance',
				updateSite: true
			}
		};
		config = config || {};
		for (var key in config) {
			options[key] = config[key];
		}
		return options;
	}
};