var nano = require('nano');


var getCouchDB = function (options) {
    var serverUrl = options.server,
        server;
    if (options.requestOptions) {
        server = nano({
            "url": serverUrl,
            "parseUrl": false,
            "requestDefaults": options.requestOptions
        });
    } else {
        server = nano({
            "url": serverUrl,
            "parseUrl": false
        });
    }
    return server;
};

module.exports = {
    getCouchDB: getCouchDB
};