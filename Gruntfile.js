module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            target: {
                files: {
                    'dist/mlResourceEditor.min.js': ['src/mlResourceEditor.js']
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'dist/mlResourceEditor.min.css': ['src/mlResourceEditor.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['uglify', 'cssmin']);

};