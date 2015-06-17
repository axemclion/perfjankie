#!/usr/bin/env node

var program = require('commander'),
	fs = require('fs');

var oldDB, newDB;
program
	.version('0.0.1')
	.option('-c --couchServer', 'Location of the couchDB server')
	.option('-u --username <username>', 'Username of the couch user that can create design documents and save data')
	.option('-p --password <password>', 'Password of the couchDB user')
	.parse(process.argv);

program.on('--help', function() {
	console.log('Usage:');
	console.log('');
	console.log('    $ perfjankie-dbmigrate old-database new-database [options]');
	console.log('');
});

program.parse(process.argv);
if (program.args.length !== 2) {
	program.help();
}

var config = {
	log: {
		'fatal': console.error.bind(console),
		'error': console.error.bind(console),
		'warn': console.warn.bind(console),
		'info': console.info.bind(console),
		'debug': console.log.bind(console),
		'trace': console.log.bind(console),
	},

	couch: {
		server: program.couchServer || 'http://localhost:5984',
		username: program.username,
		pwd: program.password
	},

	callback: function(err, res) {
		console.log(err, res);
	}
};

console.log(program.username, program.password, oldDB, newDB)

require('./index.js')(config, program.args[0], program.args[1]).done();