module.exports = function(config) {
	var Q = require('q'),
		path = require('path'),
		dfd = Q.defer();

	var siteDest = path.join(__dirname, '../bin');

	if (config.couch.updateSite) {
		var fs = require('fs'),
			crypto = require('crypto'),
			glob = require('glob').sync,
			path = require('path');

		var log = config.log,
			server = require('nano')(config.couch.server),
			db = server.use(config.couch.database);

		log.debug('Checking if the couchapp is updated');

		var updateSite = function(site, dfd) {
			var mime = require('./mime');
			var attachments = site._attachments || {},
				attachment_md5 = site.attachment_md5 || {},
				rev = site._rev || site.rev,
				hash, files;

			function checkFile(i) {
				if (i < files.length) {
					var file = files[i],
						filename = path.join(siteDest, file).replace(/\\/g, '/');
					var data = fs.readFileSync(filename, 'utf-8'),
						hash = crypto.createHash('md5').update(data).digest('base64');
					if (typeof attachments[filename] === 'undefined' || attachment_md5[filename] !== hash) {
						attachment_md5[filename] = hash;
						var contentType = path.extname(filename);
						if (contentType.length > 0) {
							contentType = mime[contentType.substring(1)];
						}
						db.attachment.insert('_design/site', filename, data, contentType, {
							rev: rev
						}, function(err, res) {
							if (res) {
								rev = res.rev;
								log.info('Uploaded', filename);
							} else {
								log.error('Error uploading', filename, err.description, rev);
							}
							checkFile(i + 1);
						});
					} else {
						checkFile(i + 1);
					}
				} else {
					log.debug('All site files updated');
					db.get('_design/site', function(err, res) {
						res.attachment_md5 = attachment_md5;
						db.insert(res, function(err, res) {
							log.debug('Site MD5 updated');
							err ? dfd.reject(err) : dfd.resolve(res);
						});
					});
				}
			}

			require('../www')(siteDest).then(function() {
				files = glob('**/*.*', {
					cwd: siteDest
				});
				checkFile(0);
			}, function(err) {
				dfd.reject(err);
			});
		};

		db.get('_design/site', function(err, res) {
			if (err) {
				log.info('Site not found, need to create one first');
				db.insert({
					_id: '_design/site'
				}, function(err, res) {
					if (err) {
						dfd.reject(err);
					} else {
						log.info('Site created, need to update it now');
						updateSite(res, dfd);
					}
				});
			} else {
				updateSite(res, dfd);
			}
		});
	} else {
		dfd.resolve();
	}

	return dfd.promise;
};