module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'), // the package file to use
		// qunit: {
		// 	all: ['tests/*.html']
		// }
	// 	qunit: {
	// 		all: {
	// 			options: {
	// 				urls: [
	// 					'http://localhost:3000/tests/index.html',
	// 				]
	// 			}
	// 		}
	// 	}
	// });
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

	grunt.registerTask('default', ['qunit']);
	grunt.loadNpmTasks('grunt-contrib-qunit');
};
