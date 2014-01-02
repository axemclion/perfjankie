/* global describe: false, it: false */
/* jshint expr: true */

var expect = require('chai').expect,
	sinon = require('sinon'),
	fs = require('fs'),
	nano = require('nano');

describe('App', function() {
	var browserPerfStub = sinon.stub();
	browserPerfStub.callsArgWith(1, null, JSON.parse(fs.readFileSync(__dirname + '/res/sample-perf-results.json', 'utf8')));
	var util = require('./util'),
		app = require('../');

	it('should run performance tests and save results in a database', function(done) {
		app(util.config({
			callback: function(err, res) {
				expect(err).to.not.be.ok;
				expect(res).to.be.ok;
				done();
			},
			browserPerf: browserPerfStub
		}));
	});

	it('should only update site when asked to', function(done) {
		var couchDataStub = sinon.stub();
		couchDataStub.callsArgWith(2, null, []);
		app(util.config({
			couch: {
				onlyUpdateSite: true
			},
			callback: function(err, res) {
				expect(couchDataStub.called).to.not.be.true;
				expect(err).to.not.be.ok;
				expect(res).to.be.ok;
				done();
			}
		}));
	});
});