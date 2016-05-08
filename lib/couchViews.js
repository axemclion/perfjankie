/* jshint evil: true*/
var Q = require('q');

function uploadViews(db, log) {
    var dfd = Q.defer();

    var fs = require('fs'),
        glob = require('glob').sync;

    var views = glob(__dirname + '/couch-views/*.js');

    log.debug('Starting to upload views');
    (function uploadView(i) {
        if (i < views.length) {
            log.debug('Checking View ' + views[i]);
            var view = JSON.parse(JSON.stringify(eval('_x_ = ' + fs.readFileSync(views[i], 'utf-8')), function (key, val) {
                if (typeof val === 'function') {
                    return val.toString();
                }
                return val;
            }));
            db.get(view._id, function (err, res) {
                if (!err) {
                    view._rev = res._rev;
                }
                db.insert(view, function (err, res) {
                    uploadView(i + 1);
                });
            });
        } else {
            log.debug('All views updated');
            dfd.resolve();
        }
    }(0));

    return dfd.promise;
}

module.exports = function (config) {
    if (!config.couch.updateSite) {
        return Q(); // jshint ignore:line
    }

    var log = config.log,
        server = require('./utils').getCouchDB(config.couch),
        db = server.use(config.couch.database);

    return uploadViews(db, log);
};