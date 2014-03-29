module.exports = function(config) {
	var Q = require('q'),
		dfd = Q.defer();

	var nano = require('nano'),
		server = nano(config.couch.server),
		db = null,
		log = config.log;

	log.debug('Trying to see if the database exists');
	server.db.get(config.couch.database, function(err, res) {
		if (err) {
			log.debug('Could not find database: %s\nCreating a new database %s', err.reason, config.couch.database);
			server.db.create(config.couch.database, function(err, res) {
				err ? dfd.reject(err) : dfd.resolve(res);
			});
		} else {
			log.debug('Database to store results found, now saving data');
			dfd.resolve(res);
		}
	});

	return dfd.promise;
};