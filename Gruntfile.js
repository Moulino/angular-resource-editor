module.exports = function(grunt) {

    grunt.initConfig({

        concat: {
            script: {
                src: [
                    'src/js/module.js',
                    'src/js/controllers/**/*.js',
                    'src/js/directives/**/*.js',
                    'src/js/filters/**/*.js',
                    'src/js/services/**/*.js',
                    'src/js/templates/**/*.js'
                ],
                dest: 'dist/mlResourceEditor.js',
            }
        },
        uglify: {
            options: {
                mangle: false,
            },
            target: {
                files: {
                    'dist/mlResourceEditor.min.js': ['dist/mlResourceEditor.js']
                }
            }
        },

        cssmin: {
            target: {
                files: {
                    'dist/mlResourceEditor.min.css': ['src/css/styles.css']
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
                        'dist/mlResourceEditor.min.js',
                        'test/**/*.js'
                    ],
                    reporters: ['progress'],
                    port: 9876,
                    colors: true,
                    browsers: ['PhantomJS'],
                    singleRun: true
                }
            }
        },
        jshint: {
            beforeconcat: ['src/js/**/*.js'],
            afterconcat: ['dist/mlResourceEditor.js'],
            options: {
                reporter: require('jshint-stylish')
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['dist']);
    grunt.registerTask('compile', ['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'uglify', 'cssmin']);
    grunt.registerTask('test', ['karma:src']);
    grunt.registerTask('test.dist', ['karma:dist']);

};
