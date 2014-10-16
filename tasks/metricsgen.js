var Q = require('q');
var browserPerf = require('browser-perf');

module.exports = function(grunt) {
	grunt.registerMultiTask('metricsgen', 'Generates the names of metrics', function() {
		var apiDocs = new browserPerf.docs();
		var regex = /(_avg|_max|_count)$/;
		var doc = {
			fps: {
				type: 'total',
				tags: ['Frames'],
				unit: 'fps',
				source: 'ChromeTracingMetrics',
				variance: 0.5,
				summary: 'Number of Frames per second (fps) drawn on the screen. 60 fps is a good benchmark for a smooth experience',
				details: '',
				browsers: ['chrome', 'firefox', 'safari', 'ie']
			}
		};

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

		this.files.forEach(function(file) {
			grunt.file.write(file.dest, ['var METRICS_LIST =', JSON.stringify(doc)].join(''));
		});
	});
};