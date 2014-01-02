module.exports = function(config, data, callback) {
	var nano = require('nano'),
		server = nano(config.couch.server),
		db = null,
		log = config.log;

	server.db.get(config.couch.database, function(err, res) {
		if (err) {
			log.debug('Could not find database, so creating a new database', err.reason);
			server.db.create(config.couch.database, function(err, res) {
				if (err) {
					error(err);
					return;
				} else {
					log.debug('New database created');
					saveData(data, callback);
				}
			});
		} else {
			saveData(data, callback);
		}
	});

	var error = function(err) {
		log.error(err);
		callback(err, undefined);
	};

	var saveData = function(data, callback) {
		db = server.use(config.couch.database);
		log.debug('Saving data');
		db.bulk({
			docs: data.map(function(val) {
				var res = {
					meta: {},
					data: val,
					name: config.name,
					suite: config.suite,
					browser: val._browser,
					run: config.run || config.time,
					time: config.time || config.run,
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
		}, callback);
	};
};