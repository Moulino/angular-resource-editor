(function(angular) {

	"use strict";

	angular.module('mlResourceEditor', ['ngResource', 'ngMaterial']);

}(angular));
(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    var isDefined = angular.isDefined,
        isObject = angular.isObject;

    module.controller('mlEditorController', function($scope, $q, $window, $mdDialog, mlCollection, mlResource, mlEditorDialog) {
        $scope.fields = mlResource.getOptions($scope.name).fields;
        $scope.remoteErrors = {};

        $scope.ok = function() {
            var resource = mlCollection.getResource($scope.name);

            var promise = (isDefined($scope.item.id)) ? resource.update($scope.item.id, $scope.item).$promise : resource.save($scope.item).$promise;

            promise.then(function successCallback() {
                $mdDialog.hide($scope.item);
            }, function errorCallback(response) {
                if(response.data.hasOwnProperty('violations')) {
                    var remoteErrors = $scope.remoteErrors;
                    var i;

                    for(i=0; i<$scope.fields.length; i++) {
                        var field = $scope.fields[i];
                        $scope.remoteErrors[field.model] = {};
                    }

                    for(i=0; i<response.data.violations.length; i++) {
                        var violation = response.data.violations[i];
                        $scope.remoteErrors[violation.propertyPath]['error_' + i.toString()] = violation.message;
                    }

                } else {
                    alert(response.data['hydra:description']);
                }
            });
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
                isDefined(field.select_resource.resource)) 
            {
                var params = field.select_resource.params || {};
                var itemSelected = $scope.item[field.model];
                var deferred = $q.defer();

                field.select_options = [];
                field.loading = true;
                var promise = mlResource.get(field.select_resource.resource).query(params).$promise;

                promise.then(function successCallback(response) {
                    for(var idx = 0; idx < response.length -1; idx++) {
                        var item = response[idx];
                        var option = {
                            label: field.to_string(item),
                            value: item['@id']
                        };

                        field.select_options.push(option);

                        if(isObject(itemSelected) && itemSelected.hasOwnProperty('@id')) {
                            if(itemSelected['@id'] === item['@id']) {
                                $scope.item[field.model] = item['@id'];
                            }
                        }
                    }
                    deferred.resolve();
                }, function errorCallback(response) {
                    $window.alert(response.data['hydra:description']);
                    deferred.reject();
                }).finally(function() {
                    field.loading = false;
                });
                return deferred.promise;
            }
        };

        $scope.addSubResource = function(name) {
            console.log("Ajout d'une nouvelle resource de type "+name);
            mlEditorDialog.open(name);
        };
    });

}(angular));
(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');
	var isDefined = angular.isDefined;

	module.controller('mlListController', function($scope, $window, $filter, $templateCache, mlCollection, mlResource, mlEditorDialog, mlListDialog) {
		$scope.items = [];
		$scope.rowSelected = null;

		$scope.mode = $scope.mode || 'inline';
		$scope.test = $scope.test || false; // for tests only
		$scope.autoloading = isDefined($scope.autoloading) ? $scope.autoloading : true; // use for disable autoloading
		
		angular.merge($scope, mlResource.getOptions($scope.name));

		var isDialog = function() {
			return $scope.mode === 'dialog';
		};

		$scope.isDialog = isDialog;

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

		$scope.add = function(reopen) {
			mlEditorDialog.open($scope.name).then(function okCallback() {
				$scope.reload();
				if(isDialog()) {
					mlListDialog.open($scope.name);
				}
			}, function cancelCallback() {
				if(isDialog()) {
					mlListDialog.open($scope.name);
				}
			});
		};

		$scope.edit = function() {
			var item = $scope.itemSelected();

			if(null !== item) {
				mlEditorDialog.open($scope.name, angular.copy(item)).then(function okCallback(itemUpd) {
					$scope.reload();
					if(isDialog()) {
						mlListDialog.open($scope.name);
					}
				}, function cancelCallback() {
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
						$window.alert(response.data["hydra:description"]);
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
        
        if(false === $scope.test && true === $scope.autoloading) {
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
					<md-button ng-click='first()' ng-disabled='isFirstPage()' class='md-primary'>Début</md-button>\
					<md-button ng-click='previous()' ng-disabled='isFirstPage()' class='md-primary md-icon-button'>\
						<md-icon class='material-icons'>keyboard_arrow_left</md-icon>\
					</md-button>\
					<span class='pagination-pages'>{{ page }} - {{ numberOfPages() }}</span>\
					<md-button ng-click='next()' ng-disabled='isLastPage()' class='md-primary md-icon-button'>\
						<md-icon class='material-icons'>keyboard_arrow_right</md-icon>\
					</md-button>\
					<md-button ng-click='last()' ng-disabled='isLastPage()' class='md-primary'>Fin</md-button>\
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
    (function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.factory('mlEditorDialog', function($rootScope, $mdDialog, $templateCache, mlResource) {

        var template = $templateCache.get('mlEditorTemplate.html');

        return {
            open: function(name, item) {

                var isAdding = true;

                if(angular.isDefined(item)) {
                    if(angular.isDefined(item.id)) {
                        isAdding = false;
                    }
                }
                var options = mlResource.getOptions(name);

                var editorScope = $rootScope.$new(true);
                editorScope.name = name;
                editorScope.options = mlResource.getOptions(name);
                editorScope.item = angular.extend({}, mlResource.createResource(name), item);
                editorScope.title = (isAdding) ? options.title_add : options.title_edit;

                return $mdDialog.show({
                    template: template,
                    controller: 'mlEditorController',
                    scope: editorScope,
                    clickOutsideToClose: true,
                    preserveScope: true
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
                    var defaultOptions = {
                        write_access: true
                    };

                    angular.forEach(options, function (opts, name) {
                        if(angular.isUndefined(opts.uri)) {
                            throw "The uri options must be defined for the "+name+" resource.";
                        }
                        var url = (angular.isDefined(baseUrl)) ? baseUrl + "/" + opts.uri : opts.uri;
                        url += "/:slug";

                        angular.extend(opts, defaultOptions);

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
                            else if('boolean' === field.type) {
                                item[field.model] = false;
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
        <md-dialog class=\"ml-editor-template\">\
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
                <form name=\"editor\">\
                    <div ng-repeat=\"field in fields\">\
                        <md-input-container ng-if=\"field.type|inInputTypes\" md-auto-hide=\"false\">\
                            <label>{{ field.label }}</label>\
                            <input name=\"{{ field.model }}\" type=\"{{ field.type }}\" ng-model=\"item[field.model]\" ng-required=\"field.ng-required\"/>\
                            <div ng-messages = \"remoteErrors.{{ field.model }}\" ng-hide=\"remoteErrors[field.model].length\">\
                                <div ng-repeat=\"(type, message) in remoteErrors[field.model]\" ng-message=\"{{ type }}\">\
                                    {{ message }}\
                                </div>\
                            </div>\
                        </md-input-container>\
                        <md-input-container ng-if=\"field.type == 'select'\">\
                            <label>{{ field.label }}</label>\
                            <md-select name=\"{{ field.model }}\" ng-init=\"loadOptions(field)\" placeholder=\"{{ field.label }}\" ng-model=\"item[field.model]\" required md-no-asterisk=\"false\">\
                                <md-option ng-value=\"option.value\" ng-repeat=\"option in getOptions(field)\">{{ option.label }}</option>\
                            </md-select>\
                            <md-progress-circular ng-show=\"field.loading\" md-mode=\"indeterminate\" md-diameter=\"30\"></md-progress-circular>\
                            <md-button ng-click='addSubResource(field.select_resource.resource)' class='md-icon-button green'>\
                                <md-icon class='material-icons'>add</md-icon>\
                            </md-button>\
                        </md-input-container>\
                        <div ng-if=\"field.type == 'date'\">\
                            <label>{{ field.label }}</label>\
                            <md-datepicker ng-model=\"item[field.model]\" placeholder=\"{{ field.label }}\" ng-required=\"field.required === true\" aria-label=\"datetime\"></md-datepicker>\
                        </div>\
                        <div ng-if=\"field.type == 'boolean'\">\
                            <md-checkbox ng-model='item[field.model]'>{{field.label}}</md-checkbox>\
                        </div>\
                        <div ng-if=\"field.type == 'radio'\" class='radio'>\
                            <p>{{field.label}}</p>\
                            <md-radio-group ng-model='item[field.model]'>\
                                <md-radio-button ng-repeat='choice in field.choices' value='{{choice.value}}'>{{choice.label}}</md-radio-button>\
                            </md-radio-group>\
                        </div>\
                        <md-input-container ng-if=\"field.type == 'textarea'\">\
                            <label>{{ field.label }}</label>\
                            <textarea ng-model=\"item[field.model]\" columns=\"1\" md-max-length=\"150\"></textarea>\
                            <div ng-messages=\"editor-form.{{ field.model }}.$error\">\
                                <div ng-message=\"required\">Ce champs est requis</div>\
                            </div>\
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
                    <div ng-if='write_access' layout='row' layout-align='end center' class='ml-list-actions'>\
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