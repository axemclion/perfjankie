var url = require('url');
module.exports = function(config) {

	var Q = require('q');

	if (!config.couch.updateSite) {
		return Q(1); // jshint ignore:line
	}

	var path = require('path'),
		log = config.log;

	var siteDest = path.join(__dirname, '../bin-site'),
		server = require('nano')(config.couch.server),
		db = server.use(config.couch.database);

	var mime = require('./mime');

	function contentType(filename) {
		var contentType = path.extname(filename);
		if (contentType.length > 0) {
			return mime[contentType.substring(1)];
		} else {
			return 'text';
		}
	}

	function readFileContents(files, siteDest) {
		var fs = require('fs'),
			path = require('path');

		var dfd = Q.defer();
		var fileContents = [];

		(function readFile(i) {
			if (i < files.length) {
				fs.readFile(path.join(siteDest, files[i]), function(err, data) {
					if (!err) {
						fileContents.push({
							name: files[i],
							data: data,
							content_type: contentType(files[i])
						});
					}
					readFile(i + 1);
				});
			} else {
				log.debug('Completed reading all files');
				dfd.resolve(fileContents);
			}
		}(0));

		return dfd.promise;
	}

	function removeSite() {
		var dfd = Q.defer();
		db.get('_design/site', function(err, res) {
			if (!err) {
				db.destroy('_design/site', res._rev, function(err, res) {
					if (err) {
						dfd.reject(err);
					} else {
						dfd.resolve();
					}
				});
			} else {
				dfd.resolve();
			}
		});
		return dfd.promise;
	}

	return removeSite().then(function() {
		return Q.nfcall(require('glob'), '**/*.*', {
			cwd: siteDest
		});
	}).then(function(files) {
		return readFileContents(files, siteDest);
	}).then(function(fileContents) {
		return Q.ninvoke(db.multipart, 'insert', {}, fileContents, '_design/site');
	}).then(function() {
		var link = url.parse([config.couch.server, config.couch.database, '_design/site/index.html'].join('/'));
		link.auth = null;
		log.info('Site Updated. View graphs at ' + url.format(link));
	});
};