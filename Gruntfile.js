module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // the package file to use
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
            tasks: ['jshint', 'qunit']
        },
        qunit: {
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
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.registerTask('default', ['qunit']);
};
