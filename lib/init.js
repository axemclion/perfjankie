module.exports = function (config) {
    var Q = require('q'),
        server = require('./utils').getCouchDB(config.couch),
        log = config.log;

    log.debug('Trying to see if the database exists');

    return Q.ninvoke(server.db, 'get', config.couch.database).catch(function (err) {
        log.debug('Could not find database: %s\nCreating a new database %s', err.reason, config.couch.database);
        return Q.ninvoke(server.db, 'create', config.couch.database);
    }).then(function () {
        var db = server.use(config.couch.database);
        return Q.ninvoke(db, 'get', 'version').catch(function (err) {
            return Q.ninvoke(db, 'insert', {
                version: require('../package.json').dbVersion
            }, 'version');
        });
    });
};
