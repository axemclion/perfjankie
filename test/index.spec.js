/* global describe: false, it: false */
/* jshint expr: true */

var expect = require('chai').expect,
	sinon = require('sinon'),
	fs = require('fs'),
	nano = require('nano');

describe('App', function() {
	var browserPerfStub = sinon.stub();
	browserPerfStub.callsArgWith(1, [], JSON.parse(fs.readFileSync(__dirname + '/res/sample-perf-results.json', 'utf8')));

	it('should run performance tests and save results in a database', function(done) {
		var app = require('../');
		app(require('./util').config({
			callback: function(err, res) {
				expect(err).to.not.be.ok;
				expect(res).to.be.ok;
				done();
			},
			browserPerf: browserPerfStub
		}));
	});
});