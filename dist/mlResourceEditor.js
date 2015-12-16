(function(angular) {

	"use strict";

	angular.module('mlResourcesEditor', ['restangular', 'ngMaterial', 'ui.select', 'ngSanitize']);

}(angular));
(function(angular) {
    "use strict";

    var module = angular.module('mlResourcesEditor');

    module.controller('mlEditorController', function($scope, $window, $mdDialog, mlCollections, mlResources) {

        $scope.fields = mlResources.getOptions($scope.name).fields;

        $scope.ok = function() {
            $mdDialog.hide($scope.item);
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.getOptions = function (field) {
            if(angular.isUndefined(field.select_options)) {
                field.select_options = [];
            }

            return field.select_options;
        };

        $scope.refreshOptions = function(field, search) {
            if( angular.isDefined(field.select_resource) &&
                angular.isDefined(field.select_resource.resource) &&
                angular.isDefined(field.select_resource.label)) 
            {
                var params = angular.merge({}, field.select_resource.params);
                params[field.select_resource.label] = search;

                field.select_options = [];
                field.loading = true;
                mlResources.get(field.select_resource.resource).getList(params)
                    .then(function(response) {
                        angular.forEach(response, function(item) {
                            field.select_options.push({
                                label: item[field.select_resource.label],
                                value: item['@id']
                            });
                        });

                    }, function(response) {
                        $window.alert(response['hydra:description']);
                    }).finally(function() {
                        field.loading = false;
                    });
            }
        };
    });

}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.controller('mlListController', function($scope, $window, $filter, mlCollections, mlResources, mlEditorDialog, mlListDialog) {
		$scope.items = [];
		$scope.rowSelected = null;

		$scope.mode = $scope.mode || 'inline';
		$scope.test = $scope.test || false; // for tests only
		
		angular.merge($scope, mlResources.getOptions($scope.name));

		var isDialog = function() {
			return $scope.mode === 'dialog';
		};

		$scope.load = function(page) {
			page = page || 1;

			$scope.loading = true;
			$scope.items = mlCollections.getList($scope.name);
			mlCollections.load($scope.name, page).finally(function() {
				$scope.loading = false;
			});
		};

		$scope.reload = function() {
			$scope.loading = true;
			mlCollections.reload($scope.name).finally(function() {
				$scope.loading = false;
			});
		};

		$scope.itemSelected = function() {
            return ($scope.rowSelected != null) ? $scope.items[$scope.rowSelected] : null;
        };

		$scope.add = function() {
			mlEditorDialog.open($scope.name).then(function(item) {
				mlCollections.getCollection($scope.name).post(item).then(function() {
					$scope.reload();
					if(isDialog()) {
						mlListDialog.open($scope.name);
					}
				}, function(response) {
					$window.alert(response["hydra:description"]);
					$scope.add();
				});
			});
		};

		$scope.edit = function() {
			var item = $scope.itemSelected();

			if(null != item) {
				mlEditorDialog.open($scope.name, item).then(function() {
					item.save().then(function() {
						$scope.reload();
					}, function(response) {
						$window.alert(response["hydra:description"]);
						$scope.edit();
					});
				}).finally(function() {
					if(isDialog()) {
						mlListDialog.open($scope.name);
					}
				});
			}
		};

		$scope.remove = function() {
			var item = $scope.itemSelected();

			if($window.confirm($scope.question_remove)) {			
				if(null != item) {
					item.remove().then(function() {
						$scope.reload();
					}, function(response) {
						$window.alert(response["hydra:description"]);
					});
				}
			}
		};
		
		$scope.getString = function(field, item) {

            if(angular.isFunction(field.to_string)) {
            	if('select' == field.type) {
            		return field.to_string(item['_'+field.model]);
            	} else {
            		return field.to_string(item[field.model]);
            	}
            }

            // converts the date fields
            if(field.type === 'date' && angular.isDefined(field.date_format)) {
                return $filter('date')(item[field.model], field.date_format);
            }

            return item[field.model];
        };

        if(false === $scope.test) {
        	$scope.load();
        }
	});

}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.controller('mlPaginationController', function($scope, mlCollections) {
		$scope.page = 1;

		$scope.first = function() {
			$scope.page = 1;
			$scope.load($scope.page);
		};

		$scope.next = function() {
			if($scope.page < mlCollections.getNumberOfPages($scope.name)) {
				$scope.load(++$scope.page);
			}
		};

		$scope.previous = function() {
			if($scope.page > 1) {
				$scope.load(--$scope.page);
			}
		};

		$scope.last = function() {
			$scope.page = mlCollections.getNumberOfPages($scope.name);
			$scope.load($scope.page);
		};

		$scope.isFirstPage = function() {
			return mlCollections.isFirstPage($scope.name);
		};

		$scope.isLastPage = function() {
			return mlCollections.isLastPage($scope.name);
		};

		$scope.numberOfPages = function() {
			return mlCollections.getNumberOfPages($scope.name);
		};
	});
	
}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.directive('mlList', function($templateCache) {
		var listTemplate = $templateCache.get('mlListTemplate.html');

		return {
			restrict: 'A',
			controller: 'mlListController',
			scope: {
				name: '@'
			},
			template: listTemplate
		}
	});

}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.directive('mlListSelection', function() {
		return {
			restrict: 'A',
			link: function(scope, element) {
				element.find('tbody').on('click', 'tr', function () {

                    $(this).siblings('.selected').removeClass('selected');

                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('selected');
                        scope.rowSelected = null;
                    } else {
                        $(this).addClass('selected');
                        scope.rowSelected = $(this).index();
                    }
                    scope.$apply();
                });
			}
		}
	});

}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.directive('mlPagination', function() {
		return {
			require: '^ml-list',
			restrict: 'A',
			transclude: true,
			controller: 'mlPaginationController',
			template: "\
				<div layout='row' layout-sm='column' layout-align='center center' class='ml-pagination'>\
					<md-button ng-click='first()' ng-disabled='isFirstPage()' class='md-primary'>First</md-button>\
					<md-button ng-click='previous()' ng-disabled='isFirstPage()' class='md-primary md-icon-button'>\
						<md-icon class='material-icons'>keyboard_arrow_left</md-icon>\
					</md-button>\
					<span>{{ page }} - {{ numberOfPages() }}</span>\
					<md-button ng-click='next()' ng-disabled='isLastPage()' class='md-primary md-icon-button'>\
						<md-icon class='material-icons'>keyboard_arrow_right</md-icon>\
					</md-button>\
					<md-button ng-click='last()' ng-disabled='isLastPage()' class='md-primary'>Last</md-button>\
				</div>"
		};
	});

}(angular));
(function(angular) {
    "use strict";

    var module = angular.module('mlResourcesEditor');

    /*
     * Filter the simple types of 'input' (text and number)
     */
    module.filter('inInputTypes', [function () {
        var inputTypes = ['text', 'number'];

        return function (item) {
            for (var i = 0; i < inputTypes.length; i++) {
                if (inputTypes[i] == item) {
                    return true;
                }
            }
            return false;
        };
    }]);

}(angular));
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
		            if(field.type === 'select') {
		            	item['_'+field.model] = item[field.model];
		            	item[field.model] = item[field.model]['@id'];
		            }
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
(function(angular) {
    "use strict";

    var module = angular.module('mlResourcesEditor');

    module.factory('mlEditorDialog', function($rootScope, $mdDialog, $templateCache, mlResources) {

        var template = $templateCache.get('mlEditorTemplate.html');

        return {
            open: function(name, item) {

                var isAdding = angular.isUndefined(item);
                var options = mlResources.getOptions(name);

                var editorScope = $rootScope.$new(true);
                editorScope.name = name;
                editorScope.options = mlResources.getOptions(name);
                editorScope.item = (isAdding) ? mlResources.createResource(name) : item;
                editorScope.title = (isAdding) ? options.title_add : options.title_edit;

                return $mdDialog.show({
                    template: template,
                    controller: 'mlEditorController',
                    scope: editorScope,
                    clickOutsideToClose: true
                });
            }
        };
    });

}(angular));
(function(angular) {
    "use strict";

    var module = angular.module('mlResourcesEditor');

    module.factory('mlListDialog', function($rootScope, $mdDialog, $templateCache) {

        var listTemplate = $templateCache.get('mlListTemplate.html');

        var dialogTemplate = "\
            <md-dialog>\
                <md-button ng-click='cancel()' class='md-icon-button ml-close-button'>\
                    <md-icon class='material-icons'>close</md-icon>\
                </md-button>\
                <md-dialog-content class='md-dialog-content'>"+listTemplate+"</md-dialog-content>\
            </md-dialog>";

        return {
            open: function(name) {
                var listScope = $rootScope.$new(true);
                listScope.name = name;
                listScope.mode = 'dialog';
                listScope.cancel = function() {
                    $mdDialog.hide();
                };

                return $mdDialog.show({
                    template: dialogTemplate,
                    controller: 'mlListController',
                    scope: listScope,
                    clickOutsideToClose: true
                });
            }
        };
    });

}(angular));
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
                                if(!angular.isDate(val) && angular.isObject(val)) {
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

(function(angular) {
    "use strict";

     var editorTemplate ="\
        <md-dialog>\
            <md-button ng-click=\"cancel()\" class=\"md-icon-button ml-close-button\">\
                <md-icon class=\"material-icons\">close</md-icon>\
            </md-button>\
            <md-dialog-content class=\"md-dialog-content\">\
                <div class=\"ml-editor-title\">\
                    {{ title }}\
                </div>\
                <form>\
                    <div ng-repeat=\"field in fields\">\
                        <md-input-container class=\"md-block\" ng-if=\"field.type|inInputTypes\">\
                            <label>{{ field.label }}</label>\
                            <input name=\"{{ field.model }}\" type=\"{{ field.type }}\" ng-model=\"item[field.model]\" ng-required=\"field.required === true\"/>\
                        </md-input-container>\
                        <md-input-container class=\"md-block\" ng-if=\"field.type == 'select'\">\
                            <label style=\"margin: 5px 0;\">{{ field.label }}</label>\
                            <div layout=\"row\">\
                                <ui-select ng-model=\"item[field.model]\" theme=\"select2\" style=\"width: 100%;\">\
                                    <ui-select-match placeholder=\"{{ field.label }}\">{{ $select.selected.label }}</ui-select-match>\
                                    <ui-select-choices repeat=\"option in getOptions(field)\" refresh=\"refreshOptions(field, $select.search)\" refresh-delay=\"0\">\
                                        <div ng-bind-html=\"option.label | highlight: $select.search\"></div>\
                                    </ui-select-choices>\
                                </ui-select>\
                                <md-progress-circular ng-show=\"field.loading\" md-mode=\"indeterminate\" md-diameter=\"26\"></md-progress-circular>\
                            </div>\
                        </md-input-container>\
                        <div ng-if=\"field.type == 'date'\">\
                            <md-datepicker ng-model=\"item[field.model]\" md-placeholder=\"{{ field.label }}\" ng-required=\"field.required === true\" aria-label=\"datetime\"></md-datepicker>\
                        </div>\
                        <md-input-container class=\"md-block\" ng-if=\"field.type == 'textarea'\">\
                            <label>{{ field.label }}</label>\
                            <textarea ng-model=\"item[field.model]\" columns=\"1\" md-max-length=\"150\"></textarea>\
                        </md-input-container>\
                    </div>\
                    <md-dialog-actions>\
                        <md-button class=\"md-accent md-raised ml-button\" ng-click=\"cancel()\">Annuler</md-button>\
                        <md-button class=\"md-primary md-raised ml-button\" type=\"submit\" ng-click=\"ok()\">Ok</md-button>\
                    </md-dialog-actions>\
                </form>\
            </md-dialog-content>\
        </md-dialog>";

    var module = angular.module('mlResourcesEditor');

    module.run(function($templateCache) {
        $templateCache.put('mlEditorTemplate.html', editorTemplate);
    });


}(angular));
(function(angular) {
    'use strict';

    var template =
        "<div class='ml-list'>\
            <table ml-list-selection>\
                <caption>\
                    <span class='ml-list-title'>\
                        {{ title_list }}\
                    </span>\
                    <div layout='row' layout-align='end center' class='ml-list-actions'>\
                        <md-button ng-click='add()' class='md-icon-button green'>\
                            <md-icon class='material-icons'>add</md-icon>\
                        </md-button>\
                        <md-button ng-click='edit()' ng-disabled='rowSelected == null' class='md-icon-button yellow'>\
                            <md-icon class='material-icons'>create</md-icon>\
                        </md-button>\
                        <md-button ng-click='remove()' ng-disabled='rowSelected == null' class='md-icon-button red'>\
                            <md-icon class='material-icons'>delete</md-icon>\
                        </md-button>\
                    </div>\
                </caption>\
                <thead>\
                    <tr>\
                        <th ng-repeat='field in fields'>{{ field.label }}</th>\
                    </tr>\
                </thead>\
                <tbody>\
                    <tr ng-if='loading'>\
                        <td colspan='{{ fields.length }}'>\
                            <div layout='row' layout-align='center center'>\
                                <md-progress-circular md-mode='indeterminate'></md-progress-circular>\
                            </div>\
                        </td>\
                    </tr>\
                    <tr ng-if='!loading' ng-repeat='item in items'>\
                        <td ng-repeat='field in fields'>{{ getString(field, item) }}</td>\
                    </tr>\
                </tbody>\
            </table>\
            <div ml-pagination></div>\
        </div>";

    var module = angular.module('mlResourcesEditor');

    module.run(function($templateCache) {
        $templateCache.put('mlListTemplate.html', template);
    });

}(angular));