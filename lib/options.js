module.exports = function(config) {
	var noop = function() {};
	config.log = config.log || config.logger || {
		'fatal': noop,
		'error': noop,
		'warn': noop,
		'info': noop,
		'debug': noop,
		'trace': noop
	};

	function assert(expr, msg) {
		if (!expr) {
			throw new Error(msg);
		}
	}
	config.selenium = config.selenium || {
		hostname: 'localhost',
		port: 4444
	};
	config.repeat = config.repeat || 1;
	config.name = config.name || config.url;
	config.suite = config.suite || 'Default Test Suite';

	if (typeof config.callback !== 'function') {
		config.callback = noop;
	}

	if (typeof config.couch === 'undefined') {
		config.couch = {};
	}

	if (typeof config.couch.username !== 'undefined') {
		var url = require('url');
		var href = url.parse(config.couch.server);
		href.auth = config.couch.username + ':' + config.couch.pwd;
		config.couch.server = url.format(href);
	}
	assert(typeof config.couch.server !== 'undefined', 'Location to save results is not defined. Please define a couchDB server');

	config.couch.database = config.couch.db || config.couch.database;
	assert(typeof config.couch.server !== 'undefined', 'Location to save results is not defined. Please define a Database to save the results');
	return config;
};