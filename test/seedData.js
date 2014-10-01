module.exports = function(callback, count) {
	count = count || 100;
	var path = require('path');
	var sampleData = require('fs').readFileSync(path.join(__dirname, '/res/sample-perf-results.json'), 'utf8');

	var browsers = ['firefox', 'chrome'],
		components = ['component1', 'component2'],
		commits = ['commit#1', 'commit#2', 'commit#3', 'commit#4'];

	var couchData = require('./../lib/couchData'),
		config = require('./util').config();

	var rand = function(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	};

	(function genData(i) {
		var commit = rand(commits);
		config.name = rand(components);
		config.run = commit;
		config.time = parseInt(commit.substring(commit.indexOf('#') + 1), 10);
		config.suite = 'Test Suite 1';
		var data = JSON.parse(sampleData);
		for (var key in data[0]) {
			data[0][key] = data[0][key] * Math.random() * 3;
		}
		data[0]._browserName = rand(browsers);
		couchData(config, data).then(function() {
			if (i < count) {
				genData(i + 1);
			} else {
				callback(true);
			}
		}, function() {
			callback(false);
		}).done();
	}(0));
};