module.exports = function(grunt) {
  grunt.registerMultiTask('perfjankie', 'Run rendering performance test cases', function() {
    var done = this.async(),
      path = require('path'),
      options = this.options({
        log: { // Expects the following methods,
          fatal: grunt.fail.fatal.bind(grunt.fail),
          error: grunt.fail.warn.bind(grunt.fail),
          warn: grunt.log.error.bind(grunt.log),
          info: grunt.log.ok.bind(grunt.log),
          debug: grunt.verbose.writeln.bind(grunt.verbose),
          trace: grunt.log.debug.bind(grunt.log)
        },
        time: new Date().getTime()
      }),
      files = options.urls;

    options.time = parseFloat(options.time, 10);
    if (options.sauceTunnel) {
      var SauceTunnel = require('sauce-tunnel');
      grunt.log.writeln('Starting Saucelabs Tunnel');
      var tunnel = new SauceTunnel(options.SAUCE_USERNAME, options.SAUCE_ACCESSKEY, options.sauceTunnel, true);
      tunnel.start(function(status) {
        grunt.log.ok('Saucelabs Tunnel started - ' + status);
        if (status === false) {
          done(false);
        } else {
          runPerfTest(files, options, function(res) {
            grunt.verbose.writeln('All perf tests completed');
            tunnel.stop(function() {
              done(res);
            });
          });
        }
      });
    } else {
      runPerfTest(files, options, done);
    }
  });

  var perfjankie = require('..');

  var runPerfTest = function(files, options, cb) {
    var success = true;
    (function runTest(i) {
      if (i < files.length) {
        grunt.log.writeln('Testing File ', files[i]);
        var config = {
          url: files[i],
          name: files[i].replace(/(\S)*\/|\.html$/gi, ''),
          callback: function(err, res) {
            if (err) {
              success = false;
              console.log(res);
              grunt.log.warn(err);
            } else {
              grunt.log.ok('Saved performance metrics');
            }
            runTest(i + 1);
          }
        };
        for (var key in options) {
          config[key] = options[key];
        }
        perfjankie(config);
      } else {
        cb(success);
      }
    }(0));
  }
};