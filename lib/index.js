module.exports = function(config) {

	var options = require('./options')(config),
		log = options.log,
		Q = require('q');

	log.info('Starting PerfJankie');

	var init = require('./init'),
		site = require('./couchSite'),
		views = require('./couchViews'),
		data = require('./couchData'),
		perf = require('./perfTests'),
		cb = options.callback;

	init(config).then(function() {
		return Q.all([perf(config).then(function(results) {
			return data(config, results);
		}), site(config), views(config)]);
	}).then(function(res) {
		log.debug('Successfully done all tasks');
		cb(null, res);
	}, function(err) {
		console.log(err);
		cb(err, null);
	});
};