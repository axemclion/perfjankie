var expect = require('chai').expect,
    sinon = require('sinon'),
    fs = require('fs'),
    nano = require('nano');

require('q').longStackSupport = true;

describe('App', function () {
    var browserPerfStub = sinon.stub();
    var sampleData;
    var util = require('./util'),
        app = require('../'),
        config = util.config({});

    before(function (done) {
        nano(config.couch.server).db.destroy(config.couch.database, function(err, res) {
            done();
        });
    });

    beforeEach(function () {
        config.log.info('===========');
        sampleData = JSON.parse(fs.readFileSync(__dirname + '/res/sample-perf-results.json', 'utf8'));
        browserPerfStub.callsArgWith(1, null, sampleData);
    });

    it('should only update data', function (done) {
        app(util.config({
            couch: {
                updateSite: false
            },
            callback: function (err, res) {
                console.log(err);
                expect(err).to.not.be.ok;
                expect(res).to.be.ok;
                done();
            },
            browserPerf: browserPerfStub
        }));
    });

    it('should only update site', function (done) {
        var couchDataStub = sinon.stub();
        couchDataStub.callsArgWith(2, null, []);
        app(util.config({
            couch: {
                onlyUpdateSite: true
            },
            callback: function (err, res) {
                expect(couchDataStub.called).to.not.be.true;
                expect(err).to.not.be.ok;
                expect(res).to.be.ok;
                done();
            }
        }));
    });

    it('should run performance tests and save results in a database', function (done) {
        app(util.config({
            callback: function (err, res) {
                expect(err).to.not.be.ok;
                expect(res).to.be.ok;
                done();
            },
            browserPerf: browserPerfStub
        }));
    });
});