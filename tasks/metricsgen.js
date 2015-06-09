var Q = require('q');
var browserPerf = require('browser-perf');

module.exports = function(grunt) {
	grunt.registerMultiTask('metricsgen', 'Generates the names of metrics', function() {
		var apiDocs = new browserPerf.docs();
		var regex = /(_avg|_max|_count)$/;
		var doc = {};

		for (var key in apiDocs.metrics) {
			var modifier = null;
			if (apiDocs.metrics[key].source === 'TimelineMetrics' && key.match(regex)) {
				var idx = key.lastIndexOf('_');
				modifier = key.substr(idx + 1);
				key = key.substr(0, idx);
			}
			if (typeof doc[key] === 'undefined') {
				doc[key] = apiDocs.metrics[key] || {};
				doc[key].stats = [];
			}
			if (modifier) {
				doc[key].stats.push(modifier);
			}
		}

		var metrics = [];
		for (var key in doc) {
			doc[key].name = key;
			metrics.push(doc[key]);
		}

		this.files.forEach(function(file) {
			grunt.file.write(file.dest, ['var METRICS_LIST =', JSON.stringify(metrics)].join(''));
		});
	});
};