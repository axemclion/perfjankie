var fs = require('fs'),
	path = require('path'),
	Q = require('q');

function lessTask(dest) {
	var less = require('less');
	return Q.nfcall(fs.readFile, path.join(__dirname, 'main.less'), 'utf-8').then(function(data) {
		return Q.nfcall(less.render, data);
	}).then(function(css) {
		return Q.nfcall(fs.writeFile, path.join(dest, 'main.css'), css);
	});
}

function mkdirp(dirpath, dest) {
	var pathSeparatorRe = /[\/\\]/g;
	dirpath.split(pathSeparatorRe).reduce(function(parts, part) {
		parts = path.join(parts, part);
		var subpath = path.resolve(parts);
		if (!fs.existsSync(subpath)) {
			fs.mkdirSync(subpath);
		}
		return parts;
	}, dest);
}

function copyFile(src, dest) {
	if (/\/$/.test(src)) {
		return;
	}
	return function() {
		var dfd = Q.defer();

		var cbCalled = false,
			dfd = Q.defer(),
			done = function(err) {
				if (!cbCalled) {
					if (err) {
						dfd.reject(err);
					} else {
						dfd.resolve();
					}
				}
			};

		mkdirp(path.dirname(path.normalize(src)), dest);
		var rd = fs.createReadStream(path.join(__dirname, src));
		rd.on("error", done);
		var wr = fs.createWriteStream(path.join(dest, src));
		wr.on("error", done);
		wr.on("close", function(ex) {
			done();
		});
		rd.pipe(wr);
		return dfd.promise;
	};
}

function copy(patterns) {

	if (!Array.isArray(patterns)) {
		patterns = [patterns];
	}

	var glob = require('glob');
	return function(dest) {
		return patterns.map(function(pattern) {
			return function(prev) {
				return Q.nfcall(glob, pattern, {
					cwd: __dirname,
					mark: true
				}).then(function(files) {
					return prev.concat(files);
				});
			};
		}).reduce(Q.when, Q([])).then(function(files) { // jshint ignore:line
			return files.map(function(file, i) {
				return copyFile(file, dest);
			}).reduce(Q.when, Q()); // jshint ignore:line
		});
	};
}

var copyTask = {
	html: copy('./*.html'),
	img: copy('./img/**'),
	js: copy('./js/*.js'),
	lib: copy([
		'lib/angular/*.+(js|css|map)',
		'lib/bootstrap/dist/**',
		'lib/jqplot-bower/dist/*.+(js|css)',
		'lib/jqplot-bower/dist/plugins/*.+(js|css)'
	])
};

module.exports = function(dest) {
	if (!/[\/\\]/g.test(dest)) {
		dest = dest + '/';
	}
	return Q.allSettled(Object.keys(copyTask).map(function(taskName) {
		return copyTask[taskName](dest);
	}).concat(lessTask(dest)));
};

module.exports.tasks = copyTask;
module.exports.tasks.less = lessTask;