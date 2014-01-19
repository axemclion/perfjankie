/* jshint evil: true*/
module.exports = function(config) {
	var Q = require('q'),
		dfd = Q.defer();

	if (config.couch.updateSite) {
		var log = config.log,
			server = require('nano')(config.couch.server),
			db = server.use(config.couch.database),
			fs = require('fs'),
			glob = require('glob').sync;

		var views = glob(__dirname + '/../couchdb/views/*.js');
		
		log.debug('Starting to upload views');
		(function uploadView(i) {
			if (i < views.length) {
				log.debug('Checking View ' + views[i]);
				var view = JSON.parse(JSON.stringify(eval('_x_ = ' + fs.readFileSync(views[i], 'utf-8')), function(key, val) {
					if (typeof val === 'function') {
						return val.toString();
					}
					return val;
				}));
				db.get(view._id, function(err, res) {
					if (!err) {
						view._rev = res._rev;
					}
					db.insert(view, function(err, res) {
						uploadView(i + 1);
					});
				});
			} else {
				log.debug('All views updated');
				dfd.resolve();
			}
		}(0));
	} else {
		dfd.resolve();
	}

	return dfd.promise;
};