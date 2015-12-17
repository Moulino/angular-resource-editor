(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.factory('mlCollections', function($q, mlResources) {
		var self = this;

		this.lists = {};

		var factory = {
			load: function(name, page) {
				var filters = mlResources.getOptions(name).filters || {},
					collection = self.lists[name],
					deferred = $q.defer();

				if(angular.isDefined(page)) {
					filters.page = page;
				}

				if(angular.isUndefined(collection)) {
					collection = self.lists[name] = [];
				}

				factory.getCollection(name).getList(filters).then(function(items) {
					factory.clearCollection(name);
					collection.metadata = items.metadata;
					angular.forEach(items, function(item) {
						factory.addToCollection(name, item);
					});
					deferred.resolve(collection);
				}, function(error) {
					collection.length = 0;
					deferred.reject(error)
				});

				return deferred.promise;
			},

			addToCollection: function(name, item) {
				var collection = self.lists[name];
				var fields = mlResources.getOptions(name).fields || [];

				angular.forEach(fields, function(field) {

					// convert date string to date object
					if('date' == field.type) {
						item[field.model] = new Date(item[field.model]);
					}

		            // converts the select fields
		            /*if(field.type === 'select') {
		            	item['_'+field.model] = item[field.model];
		            	item[field.model] = item[field.model]['@id'];
		            }*/
				});

				collection.push(item);
			},

			clearCollection: function(name) {
				var collection = self.lists[name];
				collection.length = 0;
			},

			reload: function(name) {
				var page = factory.getPage(name);
				return factory.load(name, page);
			},

			getMetadata: function(name, key) {
				var value,
					collection = self.lists[name] || [];

				if(angular.isDefined(collection.metadata)) {
					value = collection.metadata[key];
				}

				return value;
			},

			getCollection: function(name) {
				return mlResources.get(name);
			},

			getList: function(name) {
				if(angular.isUndefined(self.lists[name])) {
					self.lists[name] = [];
				}
				return self.lists[name];
			},

			getPage: function(name) {
				var regex = /page=(\d+)/i;
				var href = factory.getMetadata(name, 'href');
				var page = 0;

				if(angular.isDefined(href)) {
					page = 1;

					var results = href.match(regex);
					if(angular.isArray(results)) {
						page = results[1];
					};
				};

				return page;
			},

			getNumberOfPages: function(name) {
				var totalItems = factory.getTotalItems(name);
				var itemsPerPage = factory.getItemsPerPage(name);

				if(
					angular.isUndefined(totalItems) ||
					angular.isUndefined(itemsPerPage)
				) {
					return 1;
				}

				var pages = totalItems / itemsPerPage;
				var truncated = Math.trunc(pages);

				return ((pages - truncated) < 0.00001) 
					? truncated : truncated +1;
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