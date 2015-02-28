module.exports = function(grunt) {

	var couchdb = require('./test/util').config({
		log: 1
	}).couch;
	var path = require('path');
	var jqplot = [
		'jquery.jqplot.min.js',
		'plugins/jqplot.categoryAxisRenderer.min.js',
		'plugins/jqplot.highlighter.min.js',
		'plugins/jqplot.canvasTextRenderer.min.js',
		'plugins/jqplot.canvasAxisTickRenderer.min.js',
		'plugins/jqplot.canvasAxisLabelRenderer.min.js',
		'plugins/jqplot.barRenderer.min.js',
		'plugins/jqplot.trendline.min.js',
		'plugins/jqplot.pieRenderer.min.js'
	];

	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'lib/*.js',
				'test/**/*.js',
				'www/**/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			},
		},

		metricsgen: {
			files: {
				dest: 'bin-site/metrics.js'
			}
		},

		uglify: {
			options: {
				mangle: false,
				sourceMap: true,
				sourceMapName: 'bin-site/main.js.map',
			},
			js: {
				files: {
					'bin-site/main.js': ['www/**/*.js', 'bin-site/**/*.js']
				}
			}
		},

		concat: {
			jqplot: {
				src: jqplot.map(function(file) {
					return 'bower_components/jqplot-bower/dist/' + file;
				}),
				dest: 'bin-site/jqplot.js'
			},
			less: {
				src: ['bower_components/jqplot-bower/dist/jquery.jqplot.min.css', 'www/app/**/*.less', 'www/assets/css/*.css'],
				dest: 'bin-site/main.less'
			}
		},

		less: {
			dev: {
				files: {
					'bin-site/main.css': 'bin-site/main.less'
				}
			},
			dist: {
				options: {
					compress: true
				},
				files: {
					'bin-site/main.css': 'bin-site/main.less'
				}
			}
		},

		autoprefixer: {
			less: {
				src: 'bin-site/main.css',
				dest: 'bin-site/main.css'
			}
		},

		copy: {
			partials: {
				expand: true,
				cwd: 'www/app',
				src: ['**/*.html'],
				dest: 'bin-site/app'
			},
			fonts: {
				expand: true,
				cwd: 'www/assets',
				src: ['fonts/*.*'],
				dest: 'bin-site/assets'
			},
			endpoints: {
				src: ['www/server/endpoints.js'],
				dest: 'bin-site/server/endpoints.js'
			}
		},

		processhtml: {
			dev: {
				options: {
					strip: true,
					data: {
						scripts: jqplot.map(function(file) {
							return 'jqplot-bower/dist/' + file;
						}).concat(grunt.file.expand({
							cwd: 'www'
						}, 'app/**/*.js')),
					}
				},
				files: {
					'bin-site/index.html': 'www/index.html'
				}
			},
			dist: {
				options: {
					data: {
						scripts: ['main.js']
					}
				},
				files: {
					'bin-site/index.html': 'www/index.html'
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					conservativeCollapse: true,
					collapseBooleanAttributes: true
				},
				files: {
					'bin-site/index.html': 'bin-site/index.html'
				}
			},
		},
		connect: {
			proxies: [{
				changeOrigin: false,
				host: 'localhost',
				port: '5984',
				context: grunt.file.expand('lib/couch-views/**/*.js').map(function(file) {
					return '/' + path.basename(file, '.js');
				}),
				rewrite: (function(files) {
					var res = {};
					files.forEach(function(file) {
						var view = path.basename(file, '.js');
						res[view + '/_view'] = ['/', couchdb.database, '/_design/', view, '/_view'].join('');
					});
					return res;
				}(grunt.file.expand('lib/couch-views/**/*.js')))
			}],
			dev: {
				options: {
					hostname: '*',
					port: 9000,
					base: ['test/res', 'bower_components', 'bin-site', 'www'],
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
					},
					useAvailablePort: true,
				}
			}
		},
		watch: {
			options: {
				livereload: true,
			},
			views: {
				files: ['lib/couch-views/*.js'],
				tasks: ['deployViews']
			},
			less: {
				files: ['www/**/*.less'],
				tasks: ['concat:less', 'less:dev', 'autoprefixer']
			},
			html: {
				files: ['www/index.html'],
				tasks: ['processhtml:dev']
			},
			others: {
				files: ['www/app/**/*.html', 'www/app/**/*.js'],
				tasks: []
			}
		},

		mochaTest: {
			options: {
				reporter: 'dot',
				timeout: 1000 * 60 * 10
			},
			unit: {
				src: ['test/**/*.spec.js'],
			}
		},
		clean: {
			all: ['bin-site', 'test.log'],
			dist: ['bin-site/jqplot.js', 'bin-site/main.less', 'bin-site/metrics.js']
		}
	});

	require('load-grunt-tasks')(grunt);
	require('./tasks/metricsgen')(grunt);

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

	grunt.registerTask('dev', ['metricsgen', 'concat:less', 'less:dev', 'autoprefixer', 'processhtml:dev', 'configureProxies:server', 'connect:dev', 'watch']);
	grunt.registerTask('dist', ['jshint', 'concat', 'metricsgen', 'uglify', 'less:dist', 'autoprefixer', 'copy', 'processhtml:dist', 'htmlmin', 'clean:dist']);
	grunt.registerTask('test', ['clean', 'dist', 'mochaTest']);

	grunt.registerTask('default', ['dev']);
};