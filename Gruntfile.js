module.exports = function(grunt) {
	var couchdb = require('./test/util').config().couch;
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'lib/**/*.js',
				'test/**/*.js'
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
					base: ['test/res', '.', './couchdb/site/'],
					livereload: true,
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
				files: ['./couchdb/views/**/*.js'],
				tasks: ['deployViews']
			},
			site: {
				files: ['./couchdb/site/**/*'],
				tasks: ['deploySite'],
			},
			devSite: {
				files: ['./couchdb/site/**/*'],
				options: {
					livereload: true
				}
			}
		},

		mochaTest: {
			options: {
				reporter: 'dot',
				timeout: 1000 * 60
			},
			unit: {
				src: ['./test/**/*.spec.js'],
			}
		},
		clean: ['test.log']
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('deploySite', function() {
		var done = this.async();
		require('./lib/couchSite')(require('./test/util.js').config(), function(err, res) {
			done(!err);
		});
	});

	grunt.registerTask('deployViews', function() {
		var done = this.async();
		require('./lib/couchViews')(require('./test/util.js').config(), function(err, res) {
			console.log(err, res);
			done(!err);
		});
	});

	grunt.registerTask('build', ['jshint']);
	grunt.registerTask('test', ['build', 'connect', 'mochaTest']);
	grunt.registerTask('dev', ['build', 'configureProxies:server', 'connect:dev', 'watch:devSite']);

	grunt.registerTask('default', ['build']);
};