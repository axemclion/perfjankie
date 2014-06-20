module.exports = function(grunt) {
	var couchdb = require('./test/util').config().couch;
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'lib/**/*.js',
				'test/**/*.js',
				'www/index.js'
			],
			options: {
				jshintrc: '.jshintrc'
			},
		},
		connect: {
			proxies: [{
				context: ['/meta', '/data'],
				changeOrigin: false,
				host: 'localhost',
				port: '5984',
				rewrite: {
					'/meta': '/' + couchdb.database + '/_design/meta',
					'/data': '/' + couchdb.database + '/_design/data'
				}
			}],
			dev: {
				options: {
					hostname: '*',
					port: 9000,
					base: ['test/res', './www', './bin'],
					//livereload: true,
					middleware: function(connect, options) {
						var middlewares = [];
						if (!Array.isArray(options.base)) {
							options.base = [options.base];
						}
						middlewares.push(require('grunt-connect-proxy/lib/utils').proxyRequest);
						options.base.forEach(function(base) {
							middlewares.push(connect.static(base));
						});
						return middlewares;
					}
				}
			}
		},
		watch: {
			views: {
				files: ['./couchdb/**/*.js'],
				tasks: ['deployViews']
			},
			less: {
				files: ['./www/main.less'],
				tasks: ['less'],
			}
		},

		mochaTest: {
			options: {
				reporter: 'dot',
				timeout: 1000 * 60 * 10
			},
			unit: {
				src: ['./test/**/*.spec.js'],
			}
		},
		clean: ['bin', 'test.log']
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('seedData', function() {
		var done = this.async();
		require('./test/seedData')(done, 100);
	});

	grunt.registerTask('deployViews', function() {
		var done = this.async();
		require('./lib/couchViews')(require('./test/util.js').config(), function(err, res) {
			console.log(err, res);
			done(!err);
		});
	});

	grunt.registerTask('less', function() {
		var done = this.async();
		grunt.file.mkdir('./bin');
		require('./www/index').tasks.less('./bin').then(function() {
			done(true);
		}, function() {
			done(false);
		}).done();
	});

	grunt.registerTask('genSite', function() {
		var done = this.async();
		grunt.file.mkdir('./bin');
		require('./www/index')('./bin').then(function() {
			done(true);
		}, function() {
			done(false);
		}).done();
	});

	grunt.registerTask('build', ['jshint', 'genSite']);
	grunt.registerTask('test', ['build', 'mochaTest']);
	grunt.registerTask('dev', ['build', 'configureProxies:server', 'connect:dev', 'watch:less']);

	grunt.registerTask('default', ['build']);
};