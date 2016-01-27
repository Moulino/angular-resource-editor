(function(angular) {

	"use strict";
	
	var module = angular.module('mlResourceEditor');

	module.provider('mlResource', function() {
		var resources = this.resources = {};
		var options = this.options = {};
		var baseUrl;
        var defaultHeaders = {};

		this.setBaseUrl = function(url) {
			baseUrl = url;
		};

        this.setDefaultHeaders = function(headers) {
            defaultHeaders = headers;
        };

		this.addResource = function (opts) {
            var name = opts.name;
            options[name] = opts;
        };

        this.$get = function ($window, $filter, $resource) {

            var service = {
                /*
                 * Initializes the resources from the options configured by the 'addResource' function.
                 */
                init: function () {
                    angular.forEach(options, function (opts, name) {
                        if(angular.isUndefined(opts.uri)) {
                            throw "The uri options must be defined for the "+name+" resource.";
                        }
                        var url = (angular.isDefined(baseUrl)) ? baseUrl + "/" + opts.uri : opts.uri;
                        url += "/:slug";

                        resources[name] = $resource(url, {slug: '@id'}, {
                            query: {
                                isArray: true,
                                transformResponse: function(data, headersGetter) {
                                    var populateId = function(obj) {
                                        var link = obj['@id'];

                                        if(angular.isDefined(link)) {
                                            var matches = link.match(/\/(\d+)$/);
                                            if(matches) {
                                                obj.id = matches[1];
                                            }
                                        }
                                    };

                                    data = angular.fromJson(data);
                                    var collectionResponse = data['hydra:member'];
                                    collectionResponse.metadata = {};

                                    angular.forEach(data, function(value, key) {
                                        if('hydra:member' !== key) {
                                            collectionResponse.metadata[key] = value;
                                        }
                                    });

                                    angular.forEach(collectionResponse, function(value) {
                                        populateId(value);
                                    });

                                    return collectionResponse;
                                }
                            },
                            update: {
                                method: 'PUT'
                            }
                        });
                    });
                },

                get: function (name) {
                    return resources[name];
                },

                getOptions: function (name) {
                    return options[name];
                },

                createResource: function(name) {
                    var fields = service.getOptions(name).fields;

                    var item = {};
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
