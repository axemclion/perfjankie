#!/usr/bin/env node

var program = require('commander'),
	fs = require('fs');

program
	.version('0.0.1')
	.option('-c --config-file <configFile>', 'Specify a configuration file. If other options are specified, they have precedence over options in config file')
	.option('-s, --selenium <serverURL>', 'Specify Selenium Server, like localhost:4444 or ondemand.saucelabs.com:80', 'localhost:4444')
	.option('-u --username <username>', 'Sauce, BrowserStack or Selenium User Name')
	.option('-a --accesskey <accesskey>', 'Sauce, BrowserStack or Selenium Access Key')
	.option('--browsers <browsers>', 'List of browsers to run the tests on')
	.option('--couch-server <couchServer>', 'Location of the couchDB server', 'http://localhost:5984')
	.option('--couch-database <couchDatabase>', 'Name of the couch database')
	.option('--couch-user <couchUser>', 'Username of the couch user that can create design documents and save data')
	.option('--couch-pwd <couchPwd>', 'Password of the couchDB user')
	.option('--name <name>', 'A friendly name for the URL. This is shown as component name in the dashboard')
	.option('--run <run>', 'A hash for the commit, or any identifier displayed in the x-axis in the dashboard')
	.option('--time <time>', 'Used to sort the data when displaying graph. Can be the time or a sequence number when a commit was made', new Date().getTime())
	.option('--suite <suite>', 'Displayed as the title in the dashboard.')
	.option('--update-site', 'Update the site in addition to running the tests', true)
	.option('--only-update-site', 'Only update the site, do not run tests or save data for the site', false)
	.option('--migrate <newDbName>', 'Migrate Database to the latest version')
	.parse(process.argv);

var config = {};
if (program.configFile) {
	try {
		var config = JSON.parse(fs.readFileSync(program.configFile));
	} catch (e) {
		throw e;
	}
}

var extend = function(obj1, obj2) {
	for (var key in obj2) {
		if (typeof obj1[key] !== 'undefined' && typeof obj2[key] === 'object') {
			obj1[key] = extend(obj1[key], obj2[key]);
		} else if (typeof obj2[key] !== 'undefined') {
			obj1[key] = obj2[key];
		}
	}
	return obj1;
};

config = extend(config, {
	url: program.args[0],
	name: program.name,
	suite: program.suite,
	time: program.time,
	run: program.run,

	selenium: program.serverURL,
	browsers: program.browsers,
	username: program.username,
	accesskey: program.accesskey,

	log: {
		'fatal': console.error.bind(console),
		'error': console.error.bind(console),
		'warn': console.warn.bind(console),
		'info': console.info.bind(console),
		'debug': console.log.bind(console),
		'trace': console.trace.bind(console),
	},

	couch: {
		server: program.couchServer,
		database: program.couchDatabase,
		updateSite: program.onlyUpdateSite ? true : program.updateSite,
		onlyUpdateSite: program.onlyUpdateSite,
		username: program.couchUser,
		pwd: program.couchPwd
	},

	callback: function(err, res) {
		console.log(err, res);
	}
});

if (program.migrate) {
	console.log('Runnung database migrations');
	require('../migrations/index.js')(config, program.migrate).done();
} else {
	require('./')(config);
}