var fs = require('fs'),
	path = require('path'),
	glob = require('glob'),
	ncp = require('ncp').ncp,
	Q = require('q');

function lessTask(dest) {
	var less = require('less');
	return Q.nfcall(fs.readFile, path.join(__dirname, 'main.less'), 'utf-8').then(function(data) {
		return Q.nfcall(less.render, data);
	}).then(function(css) {
		return Q.nfcall(fs.writeFile, path.join(dest, 'main.css'), css);
	});
}

function copy(src) {
	return function(dest) {
		return Q.nfcall(glob, src, {
			cwd: __dirname
		}).then(function(files) {
			return files.map(function(file, i) {
				return Q.nfcall(ncp, path.resolve(__dirname, file), path.resolve(dest, file));
			}).reduce(Q.when, 0);
		});
	};
}

var copyTask = {
	html: copy('./*.html'),
	lib: copy('./lib'),
	img: copy('./img'),
	js: copy('./*.js')
};

module.exports = function(dest) {
	return Q.allSettled(Object.keys(copyTask).map(function(taskName) {
		return copyTask[taskName](dest);
	}).concat(lessTask(dest)));
};

module.exports.tasks = copyTask;
module.exports.tasks.less = lessTask;