(function(angular) {

	"use strict";
	
	var module = angular.module('mlResourcesEditor');

	module.provider('mlResources', function() {
		var resources = this.resources = {};
		var options = this.options = {};
		var baseUrl;

		this.setBaseUrl = function(url) {
			baseUrl = url;
		};

		this.addResource = function (opts) {
            var name = opts.name;
            options[name] = opts;
        };

        this.$get = function ($window, Restangular) {

            var service = {
                /*
                 * Initializes the resources from the options configured by the 'addResource' function.
                 */
                init: function () {

                	Restangular.setBaseUrl(baseUrl);
                	Restangular.setRestangularFields({
                		id: '@id'
                	});

                    Restangular.setSelfLinkAbsoluteUrl(false);

                	Restangular.addResponseInterceptor(function (data, operation) {
			            // Remove trailing slash to make Restangular working
			            function populateHref(data) {
			                if (data['@id']) {
			                    data.href = data['@id'].substring(1);
			                }
			            }

			            // Populate href property for the collection
			            populateHref(data);

			            if ('getList' === operation) {
			                var collectionResponse = data['hydra:member'];
			                collectionResponse.metadata = {};

			                // Put metadata in a property of the collection
			                angular.forEach(data, function (value, key) {
			                    if ('hydra:member' !== key) {
			                        collectionResponse.metadata[key] = value;
			                    }
			                });

			                // Populate href property for all elements of the collection
			                angular.forEach(collectionResponse, function (value) {
			                    populateHref(value);
			                });

			                return collectionResponse;
			            }

			            return data;
			        });

                    Restangular.addRequestInterceptor(function(element, operation) {
                        if('post' == operation) {
                            angular.forEach(element, function(val, key) {
                                if(angular.isObject(val)) {
                                    element[key] = val.value;
                                };
                            });
                        }
                        return element;
                    });

                    angular.forEach(options, function (opts, name) {
                        resources[name] = Restangular.all(opts.uri);
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
