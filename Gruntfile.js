module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            options: {
                mangle: false,
            },
            target: {
                files: {
                    'dist/mlResourcesEditor.min.js': [
                        'src/js/module.js',
                        'src/js/controllers/**/*.js',
                        'src/js/directives/**/*.js',
                        'src/js/filters/**/*.js',
                        'src/js/services/**/*.js',
                        'src/js/templates/**/*.js'
                    ]
                }
            }
        },

        cssmin: {
            target: {
                files: {
                    'dist/mlResourcesEditor.min.css': ['src/css/styles.css']
                }
            }
        },

        karma: {
            src: {
                configFile: 'karma.conf.js',
                singleRun: true
            },
            dist: {
                options: {
                    basePath: '',
                    frameworks: [
                        'jasmine',
                        'jasmine-matchers',
                        'jasmine-jquery-matchers'
                    ],
                    files: [
                        'bower_components/jquery/dist/jquery.min.js',
                        'bower_components/angular/angular.min.js',
                        'bower_components/angular-animate/angular-animate.min.js',
                        'bower_components/angular-aria/angular-aria.min.js',
                        'bower_components/angular-sanitize/angular-sanitize.min.js',
                        'bower_components/angular-mocks/angular-mocks.min.js',
                        'bower_components/restangular/restangular.min.js',
                        'bower_components/lodash/lodash.min.js',
                        'bower_components/angular-material/angular-material.min.js',
                        'bower_components/angular-ui-select/angular-ui-select.min.js',
                        'dist/mlResourcesEditor.min.js',
                        'test/**/*.js'
                    ],
                    reporters: ['progress'],
                    port: 9876,
                    colors: true,
                    browsers: ['PhantomJS'],
                    singleRun: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', ['dist']);
    grunt.registerTask('dist', ['uglify', 'cssmin']);
    grunt.registerTask('test', ['karma:src']);
    grunt.registerTask('test.dist', ['karma:dist']);

};