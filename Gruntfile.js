module.exports = function(grunt) {
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
			site: {
				options: {
					hostname: '*',
					port: 9000,
					base: ['test/res', '.', './couchdb/site/']
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
				tasks: ['deploySite']
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

	grunt.registerTask('build', ['clean', 'jshint']);
	grunt.registerTask('test', ['build', 'connect', 'mochaTest']);
	grunt.registerTask('dev', ['build', 'test', 'watch']);
};