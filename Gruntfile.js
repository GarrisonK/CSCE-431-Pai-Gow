module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // the package file to use
		exec: {
			test_merger: {
				command: 'cat app.js tests/test.js > tests/app_merged.js',
				stdout: false,
				stdin: false
			},
			test_runner: {
				//Runs unit tests for server code
				command: 'qunit --code ./tests/app_merged.js --tests /dev/null',
				stdout: true,
				stdin: false
			}
			
		},
        jshint: {
            files: ['app.js'],
            options: {
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        watch: {
            files: ['*.js', 'tests/*.html', 'tests/*.js'],
            tasks: ['exec', 'jshint']
        },
        qunit: {
			//Unit tests for client code
            all: {
                options: {
                    timeout: 5000,
                    urls: [
                        'tests/index.html'
                    ]
                }
            }
        }
    });
	grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.registerTask('default', ['exec', 'jshint', 'qunit']);
};
