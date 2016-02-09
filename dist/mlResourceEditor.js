(function(angular) {

	"use strict";

	angular.module('mlResourceEditor', ['ngResource', 'ngMaterial']);

}(angular));
(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    var isDefined = angular.isDefined,
        isObject = angular.isObject;

    module.controller('mlEditorController', function($scope, $q, $window, $mdDialog, mlCollection, mlResource) {

        $scope.fields = mlResource.getOptions($scope.name).fields;

        $scope.ok = function() {
            $mdDialog.hide($scope.item);
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };


        /*
         * Returns the list of options if they are defined
         * @param field <Object> Field option for the item selected
         * @return <array> Options for select widget
         */
        $scope.getOptions = function (field) {
            if(angular.isUndefined(field.select_options)) {
                field.select_options = [];
            }

            return field.select_options;
        };

        /*
         * Load the options for select widget from resource configured
         * @param field <Object> Field option for the item selected
         */
        $scope.loadOptions = function(field) {
            if( isDefined(field.select_resource) &&
                isDefined(field.select_resource.resource) &&
                isDefined(field.select_resource.label)) 
            {
                var params = field.select_resource.params || {};
                var itemSelected = $scope.item[field.model];
                var deferred = $q.defer();

                field.select_options = [];
                mlResource.get(field.select_resource.resource).query(params, function(response) {
                    angular.forEach(response, function(item) {
                        var option = {
                            label: item[field.select_resource.label],
                            value: item['@id']
                        };

                        field.select_options.push(option);

                        if(isObject(itemSelected) && itemSelected.hasOwnProperty('@id')) {
                            if(itemSelected['@id'] === item['@id']) {
                                $scope.item[field.model] = item['@id'];
                            }
                        }
                    });
                    deferred.resolve();
                }, function(response) {
                    $window.alert(response['hydra:description']);
                    deferred.reject();
                });
                return deferred.promise;
            }
        };
    });

}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

	module.controller('mlListController', function($scope, $window, $filter, mlCollection, mlResource, mlEditorDialog, mlListDialog) {
		$scope.items = [];
		$scope.rowSelected = null;

		$scope.mode = $scope.mode || 'inline';
		$scope.test = $scope.test || false; // for tests only
		
		angular.merge($scope, mlResource.getOptions($scope.name));

		var isDialog = function() {
			return $scope.mode === 'dialog';
		};

		$scope.load = function(page) {
			page = page || 1;

			$scope.loading = true;
			$scope.items = mlCollection.get($scope.name);
			mlCollection.load($scope.name, page).finally(function() {
				$scope.loading = false;
			});
		};

		/*
		 * Reload the collection at the same page
		 */
		$scope.reload = function() {
			$scope.loading = true;
			mlCollection.reload($scope.name).finally(function() {
				$scope.loading = false;
			});
		};

		$scope.itemSelected = function() {
            return ($scope.rowSelected !== null) ? $scope.items[$scope.rowSelected] : null;
        };

		$scope.add = function() {
			mlEditorDialog.open($scope.name).then(function(item) {
				mlCollection.getResource($scope.name).save(item, function() {
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

			if(null !== item) {
				mlEditorDialog.open($scope.name, angular.copy(item)).then(function(itemUpd) {
					itemUpd.$update(function() {
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
			if($window.confirm($scope.question_remove)) {
				var item = $scope.itemSelected();		
				if(null !== item) {
					item.$delete().then(function() {
						$scope.reload();
					}, function(response) {
						$window.alert(response["hydra:description"]);
					});
				}
			}
		};
		
		$scope.getString = function(field, item) {

            if(angular.isFunction(field.to_string)) {
            	return field.to_string(item[field.model]);
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

	var module = angular.module('mlResourceEditor');

	module.controller('mlPaginationController', function($scope, mlCollection) {
		$scope.page = 1;

		$scope.first = function() {
			$scope.page = 1;
			$scope.load($scope.page);
		};

		$scope.next = function() {
			if($scope.page < mlCollection.getNumberOfPages($scope.name)) {
				$scope.load(++$scope.page);
			}
		};

		$scope.previous = function() {
			if($scope.page > 1) {
				$scope.load(--$scope.page);
			}
		};

		$scope.last = function() {
			$scope.page = mlCollection.getNumberOfPages($scope.name);
			$scope.load($scope.page);
		};

		$scope.isFirstPage = function() {
			return mlCollection.isFirstPage($scope.name);
		};

		$scope.isLastPage = function() {
			return mlCollection.isLastPage($scope.name);
		};

		$scope.numberOfPages = function() {
			return mlCollection.getNumberOfPages($scope.name);
		};
	});
	
}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

	module.directive('mlList', function($templateCache) {
		var listTemplate = $templateCache.get('mlListTemplate.html');

		return {
			restrict: 'A',
			controller: 'mlListController',
			scope: {
				name: '@'
			},
			template: listTemplate
		};
	});

}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

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
		};
	});

}(angular));
/*jshint multistr: true */
(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

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
					<span class='pagination-pages'>{{ page }} - {{ numberOfPages() }}</span>\
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

    var module = angular.module('mlResourceEditor');

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

	var module = angular.module('mlResourceEditor');

	module.factory('mlCollection', function($q, mlResource) {
		var self = this;

		this.collections = {};

		var factory = {

			load: function(name, page) {
				var filters = mlResource.getOptions(name).filters || {},
					collection = factory.get(name),
					deferred = $q.defer();

				if(angular.isDefined(page)) {
					filters.page = page;
				}

				factory.getResource(name).query(filters, function(items) {
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
(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.factory('mlEditorDialog', function($rootScope, $mdDialog, $templateCache, mlResource) {

        var template = $templateCache.get('mlEditorTemplate.html');

        return {
            open: function(name, item) {

                var isAdding = angular.isUndefined(item);
                var options = mlResource.getOptions(name);

                var editorScope = $rootScope.$new(true);
                editorScope.name = name;
                editorScope.options = mlResource.getOptions(name);
                editorScope.item = (isAdding) ? mlResource.createResource(name) : item;
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
/*jshint multistr: true */
(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.factory('mlListDialog', function($rootScope, $mdDialog, $templateCache) {

        var listTemplate = $templateCache.get('mlListTemplate.html');

        var dialogTemplate = "\
            <md-dialog>\
                <md-toolbar>\
                    <div class=\"md-toolbar-tools\">\
                        <span>{{ title_list }}</span>\
                        <span flex></span>\
                        <md-button ng-click=\"cancel()\">\
                            <md-icon class=\"material-icons\">close</md-icon>\
                        </md-button>\
                    </div>\
                </md-toolbar>\
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
                                    var metadata = {};

                                    angular.forEach(data, function(value, key) {
                                        if('hydra:member' !== key) {
                                            metadata[key] = value;
                                        }
                                    });

                                    angular.forEach(collectionResponse, function(value) {
                                        populateId(value);
                                    });

                                    collectionResponse.push(metadata); // add the metadata object at the end of the collection

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

/*jshint multistr: true */
(function(angular) {
    "use strict";

     var editorTemplate ="\
        <md-dialog>\
            <md-toolbar>\
                <div class=\"md-toolbar-tools\">\
                    <span>{{ title }}</span>\
                    <span flex></span>\
                    <md-button ng-click=\"cancel()\">\
                        <md-icon class=\"material-icons\">close</md-icon>\
                    </md-button>\
                </div>\
            </md-toolbar>\
            <md-dialog-content class=\"md-dialog-content\">\
                <form>\
                    <div ng-repeat=\"field in fields\">\
                        <md-input-container class=\"md-block\" ng-if=\"field.type|inInputTypes\">\
                            <label>{{ field.label }}</label>\
                            <input name=\"{{ field.model }}\" type=\"{{ field.type }}\" ng-model=\"item[field.model]\" ng-required=\"field.required === true\"/>\
                        </md-input-container>\
                        <md-input-container class=\"md-block\" ng-if=\"field.type == 'select'\">\
                            <label style=\"margin: 5px 0;\">{{ field.label }}</label>\
                            <md-select ng-init=\"loadOptions(field)\" placeholder=\"{{ field.label }}\" ng-model=\"item[field.model]\" md-on-open=\"loadOptions(field)\">\
                                <md-option ng-value=\"option.value\" ng-repeat=\"option in getOptions(field)\">{{ option.label }}</option>\
                            </md-select>\
                        </md-input-container>\
                        <div ng-if=\"field.type == 'date'\">\
                            <label>{{ field.label }}</label>\
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

    var module = angular.module('mlResourceEditor');

    module.run(function($templateCache) {
        $templateCache.put('mlEditorTemplate.html', editorTemplate);
    });


}(angular));
/*jshint multistr: true */
(function(angular) {
    'use strict';

    var template =
        "<div class='ml-list'>\
            <table ml-list-selection>\
                <span ng-if='mode != \"dialog\"' class='ml-list-title'>{{ title_list || '' }}</span>\
                <caption>\
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

    var module = angular.module('mlResourceEditor');

    module.run(function($templateCache) {
        $templateCache.put('mlListTemplate.html', template);
    });

}(angular));