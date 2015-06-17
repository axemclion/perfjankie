var semver = require('semver');
var glob = require('glob');
var nano = require('nano');
var Q = require('q');

Q.longStackSupport = true;

var dbInit = require('../lib/init.js');

module.exports = function migrate(opts, oldDBName, newDBName) {
	var config = require('../lib/options')(opts);
	var server = nano(config.couch.server);
	var oldDB = server.use(oldDBName);

	config.couch.updateSite = true;
	config.couch.database = newDBName;

	return dbInit(config).then(function() {
		config.log.info('Migrating from ', oldDBName, 'to', newDBName);
		return Q.ninvoke(oldDB, 'get', 'version').then(function(version) {
			return version[0].version;
		}, function() {
			return '0.1.0';
		});
	}).then(function(oldDBVersion) {
		return glob.sync('migrate-*.js', {
			cwd: __dirname
		}).filter(function(file) {
			return semver.lt(oldDBVersion, file.slice(8, -3));
		}).sort(function(a, b) {
			return semver.gt(a.slice(8, -3), b.slice(8, -3));
		});
	}).then(function(files) {
		if (files.length === 0) {
			config.log.info('Database is already up to date');
		}
		return files.map(function(file) {
			var script = require('./' + file);
			config.log.info('\nRunning migration - %s', file);
			return script(oldDB, server.use(newDBName), config);
		}).reduce(Q.when, Q());
	}).then(function() {
		config.log.info('Updating views');
		return require('../lib/couchViews.js')(config);
	}).then(function() {
		config.log.info('Updating site');
		return require('../lib/couchSite.js')(config);
	});
};