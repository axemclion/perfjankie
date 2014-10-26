module.exports = function(config, data) {
	var nano = require('nano'),
		Q = require('q'),
		dfd = Q.defer();

	var server = nano(config.couch.server),
		db = null,
		log = config.log;

	db = server.use(config.couch.database);
	log.debug('Saving data');

	if (typeof data === 'undefined') {
		return;
	}

	db.bulk({
		docs: data.map(function(val) {
			var res = {
				url: config.url,
				data: val,
				meta: {},
				name: config.name,
				suite: config.suite,
				browser: val._browser || val._browserName,
				run: config.run || config.time,
				time: parseFloat(config.time, 10),
				type: 'perfData'
			};
			for (var key in res.data) {
				if (key.indexOf('_') === 0) {
					res.meta[key] = res.data[key];
					delete res.data[key];
				}
			}
			return res;
		})
	}, {
		new_edits: true
	}, function(err, res) {
		log.debug('Got result back after saving data');
		err ? dfd.reject(err) : dfd.resolve(res);
	});

	return dfd.promise;
};