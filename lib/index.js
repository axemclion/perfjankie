var Q = require('q');

var init = require('./init'),
	site = require('./couchSite'),
	views = require('./couchViews'),
	data = require('./couchData'),
	perf = require('./perfTests');

module.exports = function(config) {
	var options = require('./options')(config),
		log = options.log,
		cb = options.callback;

	log.info('Starting PerfJankie');

	init(config).then(function() {
		return runTests(config);
	}).then(function() {
		return Q.allSettled([site(config), views(config)]);
	}).then(function(res) {
		log.debug('Successfully done all tasks');
		cb(null, res);
	}, function(err) {
		log.debug(err);
		cb(err, null);
	}).done();
};

function runTests(config) {
	var dfd = Q.defer();

	(function next(i) {
		if (i < config.repeat) {
			perf(config).then(function(results) {
				return data(config, results);
			}).then(function() {
				next(i + 1);
			}, function(err) {
				dfd.reject(err);
			}).done();
		} else {
			dfd.resolve();
		}
	}(0));


	return dfd.promise;
}