module.exports = {
	config: function(config) {
		var bunyan = require('bunyan'),
			bFormat = require('bunyan-format');

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
			"log": bunyan.createLogger({
				name: 'TEST',
				level: 'debug',
				stream: bFormat({
					outputMode: 'short',
					color: false
				}, require('fs').createWriteStream('test.log', {
					flags: 'a'
				})),
			}),
			"couch": {
				server: 'http://admin_user:admin_pass@localhost:5984',
				database: 'performance',
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