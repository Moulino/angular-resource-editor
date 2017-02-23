(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

	module.factory('mlCollection', function($q, mlResource) {
		var self = this;

		this.collections = {};

		var factory = {

			load: function(name, page, params) {
				var parameters = mlResource.getOptions(name).filters || {},
					collection = factory.get(name),
					deferred = $q.defer();

				if(angular.isDefined(page)) {
					parameters.page = page;
				}

				angular.extend(parameters, params);

				factory.getResource(name).query(parameters, function(items) {
					factory.clear(name);
					collection.metadata = items.pop(); // get the metadata object
					angular.forEach(items, function(item) {
						factory.addToCollection(name, item);
					});
					deferred.resolve(collection);
				}, function(error) {
					factory.clear(name);
					deferred.reject(error);
				});

				return deferred.promise;
			},

			addToCollection: function(name, item) {
				var collection = factory.get(name);
				var fields = mlResource.getOptions(name).fields || [];

				angular.forEach(fields, function(field) {

					// convert date string to date object
					if('date' == field.type) {
						item[field.model] = new Date(item[field.model]);
					}
				});

				collection.push(item);
			},

			create: function(name) {
				self.collections[name] = self.collections[name] || [];
			},

			exist: function(name) {
				return angular.isDefined(self.collections[name]);
			},

			clear: function(name) {
				self.collections[name].length = 0;
			},

			reload: function(name) {
				var page = factory.getPage(name);
				return factory.load(name, page);
			},

			getMetadata: function(name, key) {
				var value,
					collection = factory.get(name);

				if(angular.isDefined(collection.metadata)) {
					value = collection.metadata[key];
				}

				return value;
			},

			getResource: function(name) {
				return mlResource.get(name);
			},

			get: function(name) {
				if(angular.isUndefined(self.collections[name])) {
					factory.create(name);
				}
				return self.collections[name];
			},

			getPage: function(name) {
				var regex = /page=(\d+)/i;
				var href = factory.getMetadata(name, '@id');
				var page = 1;

				if(angular.isDefined(href)) {
					var results = href.match(regex);
					if(angular.isArray(results)) {
						page = parseInt(results[1]);
					}
				}

				return page;
			},

			getNumberOfPages: function(name) {
				var totalItems = factory.getTotalItems(name);
				var itemsPerPage = factory.getItemsPerPage(name);

				if(0 === itemsPerPage) {
					return 0;
				}

				if(
					angular.isUndefined(totalItems) ||
					angular.isUndefined(itemsPerPage)
				) {
					return 1;
				}

				var pages = totalItems / itemsPerPage;
				var truncated = parseInt(pages, 10);

				return ((pages - truncated) < 0.00001) ? truncated : truncated +1;
			},

			getTotalItems: function(name) {
				return factory.getMetadata(name, 'hydra:totalItems');
			},

			getItemsPerPage: function(name) {
				return factory.getMetadata(name, 'hydra:itemsPerPage');
			},

			isLastPage: function(name) {
				return angular.isUndefined(factory.getMetadata(name, 'hydra:nextPage'));
			},

			isFirstPage: function(name) {
				return angular.isUndefined(factory.getMetadata(name, 'hydra:previousPage'));
			}
		};

		return factory;
	});

}(angular));