(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    /*
     * This service manages resources, collections and parameters.
     * It is configurable through the 'addResource' method from the provider.
     */
    module.provider('mlResources', function () {
        var resources = this.resources = {};
        var collections = this.collections = {};
        var options = this.options = {};

        this.addResource = function (opts) {
            var name = opts.name;
            options[name] = opts;
        };

        this.$get = function ($resource, $window, mlResourceTransform) {

            var service = {
                /*
                 * Initializes the resources from the options configured by the 'addResource' function.
                 */
                init: function () {

                    var defaultActions = {
                        'query': {
                            isArray: true,
                            method: 'GET',
                            transformResponse: mlResourceTransform.response
                        },
                        'update': {
                            method: 'PUT',
                            transformRequest: mlResourceTransform.request
                        },
                        'save': {
                            method: 'POST',
                            transformRequest: mlResourceTransform.request
                        }
                    };

                    angular.forEach(options, function (opts, name) {

                        var actions = {};
                        angular.merge(actions, defaultActions, opts.actions);

                        resources[name] = $resource(opts.url, opts.url_params, actions);
                        collections[name] = [];
                        service.load(name);
                    });
                },

                /*
                 * Loads the collection
                 */
                load: function (name) {
                    if(angular.isUndefined(name)) {
                        throw "The function load() from mlResources service requires the 'name' attribut.";
                    }

                    var resource = service.getResource(name);
                    var collection = service.getCollection(name);

                    resource.query().$promise
                        .then(
                        function (data) {
                            collection.length = 0;
                            for (var i = 0; i < data.length; i++) {
                                collection.push(data[i]);
                            }
                        },
                        function (err) {
                            $window.alert(err.statusText);
                        }
                    );
                },

                getResource: function (name) {
                    return resources[name];
                },

                getCollection: function (name) {
                    return collections[name];
                },

                getOptions: function (name) {
                    return options[name];
                },

                createResource: function(name) {
                    var resource = service.getResource(name);
                    var fields = service.getOptions(name).fields;

                    var item = new resource();
                    angular.forEach(fields, function(field) {
                        if(angular.isDefined(field.type)) {
                            if('date' === field.type) {
                                item[field.model] = new Date();
                            }
                            else if('select' === field.type) {
                                item[field.model] = null;
                            }
                            else if('number' === field.type) {
                                item[field.model] = 0;
                            }
                            else if('text' === field.type) {
                                item[field.model] = '';
                            }
                        }
                    });
                    return item;
                }
            };
            return service;
        };
    });

}(angular));