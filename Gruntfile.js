module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            target: {
                files: {
                    'mlResourceEditor.min.js': ['mlResourceEditor.js']
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'mlResourceEditor.min.css': ['mlResourceEditor.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['uglify', 'cssmin']);

};