module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // the package file to use
        watch: {
            files: ['*.js', 'tests/*.html', 'tests/*.js'],
            tasks: ['qunit']
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
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.registerTask('default', ['qunit']);
};
