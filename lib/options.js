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

	if (typeof config.BROWSERSTACK_UESRNAME !== 'undefined') {
		config.browsers.forEach(function(browser) {
			browser['browserstack.user'] = config.BROWSERSTACK_UESRNAME;
			browser['browserstack.key'] = config.BROWSERSTACK_KEY;
		});
		delete config.username;
		delete config.pwd;
	} else if (typeof config.SAUCE_USERNAME !== 'undefined') {
		config.username = config.SAUCE_USERNAME;
		config.pwd = config.SAUCE_ACCESSKEY;
	}

	config.selenium = config.selenium || {
		hostname: 'localhost',
		port: 4444
	};

	if (typeof config.callback !== 'function') {
		config.callback = noop;
	}

	if (typeof config.couch === 'undefined') {
		config.couch = {};
	}

	assert(typeof config.couch.server !== 'undefined', 'Location to save results is no defined. Please define a couchDB server');

	config.couch.database = config.couch.db || config.couch.database;
	assert(typeof config.couch.server !== 'undefined', 'Location to save results is no defined. Please define a Database to save the results');

	return config;
};