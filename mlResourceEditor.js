(function(angular) {

    "use strict";

    /*
     * angular shortcuts
     */
    var forEach = angular.forEach,
        isDefined = angular.isDefined,
        isUndefined = angular.isUndefined,
        isObject = angular.isObject,
        isArray = angular.isArray,
        isDate = angular.isDate,
        isString = angular.isString,
        isFunction = angular.isFunction,
        fromJson = angular.fromJson,
        toJson = angular.toJson,
        extend = angular.extend,
        merge = angular.merge,
        copy = angular.copy;

    /*
     * Default options for the controller scope
     */
    var defaultOpts = {
        title_list: 'Resource manager',
        title_add: 'Add a resource',
        title_edit: 'Edit a resource',
        question_remove: 'Do you want to remove this resource ?'
    };

    /*
     * Module declaration
     */
    var module = angular.module('mlResourceEditor', ['ngResource', 'ngMaterial']);

    module.factory('mlUtils', function() {
        var service = {

            /*
             * Converts dates by traversing the object or array recursively
             */
            rDateConvert: function(obj) {
                forEach(obj, function(value, key) {
                    if(isObject(value)) {
                        service.rDateConvert(value);
                    }

                    else if(isString(value)) {
                        var date = new Date(value);

                        if(!isNaN(date.getDate())) {
                            obj[key] = date;
                        }
                    }
                });
            }
        };

        return service;
    });

    /*
     * Angular resource transformers for the xhr requests.
     */
    module.factory('mlResourceTransform', function(mlUtils) {
       return {
           request: function(obj) {

               forEach(obj, function (value, key) {
                   if (isObject(value) && isDefined(value.id)) {
                       obj[key] = value.id;
                   }
               });

               return toJson(obj);
           },

            response: function(data) {
                var obj = fromJson(data);

                mlUtils.rDateConvert(obj);
                return obj;
            }
        };
    });

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

                    forEach(options, function (opts, name) {

                        var actions = {};
                        merge(actions, defaultActions, opts.actions);

                        resources[name] = $resource(opts.url, opts.url_params, actions);
                        collections[name] = [];
                        service.load(name);
                    });
                },

                load: function (name) {
                    if(isUndefined(name)) {
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
                    forEach(fields, function(field) {
                        if(isDefined(field.type)) {
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

    module.directive('mlList', function($controller) {
        return {
            restrict: 'A',
            template: listTemplate,
            scope: {},
            link: function($scope, $element, $attributes) {
                $scope.name = $attributes.name;
                $scope.mode = 'inline';
                $controller('mlListController', {$scope: $scope});
            }
        };
    });

    module.directive('mlListSelection', function() {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                $element.find('tbody').on('click', 'tr', function () {

                    $(this).siblings('.selected').removeClass('selected');

                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('selected');
                        $scope.rowSelected = null;
                    } else {
                        $(this).addClass('selected');
                        $scope.rowSelected = $(this).index();
                    }
                    $scope.$apply();
                });
            }
        };
    });

    module.factory('mlEditorDialog', function($rootScope, $mdDialog, mlResources) {

        return {
            open: function(name, item) {

                var isAdding = isUndefined(item);
                var options = mlResources.getOptions(name);

                var editorScope = $rootScope.$new(true);
                editorScope.item = (isAdding) ? mlResources.createResource(name) : item;
                editorScope.title = (isAdding) ? options.title_add : options.title_edit;
                editorScope.fields = options.fields;

                return $mdDialog.show({
                    template: formTemplate,
                    controller: 'mlEditorController',
                    scope: editorScope,
                    clickOutsideToClose: true
                });
            },
            close: function() {
                $mdDialog.cancel();
            }
        };
    });

    module.factory('mlListDialog', function($rootScope, $rootElement, $mdDialog) {
        var dialogTemplate =
            "<md-dialog>"+
                "<i class='md-icon ml-close-button material-icons' ng-click='cancel()'>close</i>"+
                "<md-content-dialog class='md-dialog-content'>"+listTemplate+"</md-dialog-content>"+
            "</md-dialog>";

        return {
            open: function(name) {
                var listScope = $rootScope.$new(true);
                listScope.name = name;
                listScope.mode = 'dialog';

                return $mdDialog.show({
                    template: dialogTemplate,
                    controller: 'mlListController',
                    scope: listScope,
                    clickOutsideToClose: true,
                    parent: $rootElement
                });
            },
            close: function() {
                $mdDialog.hide();
            }
        };
    });

    module.controller('mlEditorController', function($scope, $mdDialog, mlResources) {

        $scope.ok = function() {
            $mdDialog.hide($scope.item);
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.getOptions = function (field) {
            if (isDefined(field.select_resource)) {
                return mlResources.getCollection(field.select_resource.collection);
            }
        };

        $scope.getOptionText = function (field, option) {
            var column = field.select_resource.column;
            return option[column];
        };
    });

    module.controller('mlListController', function($scope, $window, $filter, mlResources, mlEditorDialog, mlListDialog) {
        $scope.items = mlResources.getCollection($scope.name);
        $scope.loading = false;
        $scope.rowSelected = null;
        $scope.options = mlResources.getOptions($scope.name);

        extend($scope, defaultOpts, $scope.options);

        if(isUndefined($scope.mode)) {
            console.error("The mode value must be defined.");
        }

        $scope.itemSelected = function() {
            return ($scope.rowSelected != null) ? $scope.items[$scope.rowSelected] : null;
        };

        $scope.normalizeResources = function(item) {
            var normalized = copy(item);
            // associates the item to an resource for select fields
            forEach($scope.fields, function (field) {
                if (field.type === 'select' && isDefined(field.select_resource)) {
                    var model = field.model;
                    var id = normalized[model].id;

                    forEach(mlResources.getCollection(field.select_resource.collection), function (resource) {
                        if (resource.id === id) {
                            normalized[model] = resource;
                        }
                    });
                }
            });

            return normalized;
        };

        $scope.add = function() {
            mlEditorDialog.open($scope.name).then(function(item) {
                item.$save()
                    .then(function () {
                        mlResources.load($scope.name);
                        close();
                    }, function (err) {
                        console.log(err);
                    });
            }).finally(function() {
                if($scope.mode === 'dialog') {
                    mlListDialog.open($scope.name);
                }
            });
        };

        $scope.edit = function() {
            var item = $scope.itemSelected();

            item = $scope.normalizeResources(item);
            mlEditorDialog.open($scope.name, item).then(function(item) {
                item.$update()
                    .then(function () {
                        mlResources.load($scope.name);
                        $scope.rowSelected = null;
                        close();
                    }, function (err) {
                        console.log(err);
                    });
            }).finally(function() {
                if($scope.mode === 'dialog') {
                    mlListDialog.open($scope.name);
                }
            });
        };

        $scope.remove = function() {
            if ($window.confirm($scope.question_remove) === true) {
                var item = $scope.itemSelected();
                item.$remove()
                    .then(function () {
                        mlResources.load($scope.name);
                    }, function (err) {
                        $window.alert(err.statusText);
                    })
                    .finally(function () {
                        $scope.rowSelected = null;
                        $scope.confirm = null;
                    });
            }
        };

        $scope.getString = function(field, item) {

            if(isFunction(field.to_string)) {
                return field.to_string(item);
            }

            // converts the date fields
            if(field.type === 'date' && isDefined(field.date_format)) {
                return $filter('date')(item[field.model], field.date_format);
            }

            return item[field.model];
        };

    });

    var listTemplate =
        '<div class="ml-list">'+
            '<div>'+
                '<table ml-list-selection>'+
                    '<caption>'+
                        '<span class="ml-list-title">'+
                            '{{ title_list }} '+
                        '</span>'+
                        '<div class="ml-list-actions">'+
                            '<i class="md-icon material-icons green" ng-click="add()">add</i>'+
                            '<i class="md-icon material-icons yellow" ng-disabled="rowSelected == null" ng-click="edit()">create</i>'+
                            '<i class="md-icon material-icons red" ng-disabled="rowSelected == null" ng-click="remove()">delete</i>'+
                        '</div>'+
                    '</caption>'+
                    '<thead>'+
                        '<tr>'+
                            '<th ng-repeat="field in fields">{{ field.label }}</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                        '<tr ng-repeat="item in items">'+
                            '<td ng-repeat="field in fields">{{ getString(field, item) }}</td>'+
                        '</tr>'+
                    '</tbody>'+
                '</table>'+
            '</div>'+
        '</div>';

    var formTemplate =
        '<md-dialog>'+
            '<md-dialog-content class="md-dialog-content">'+
                '<i class="md-icon ml-close-button material-icons" ng-click="cancel()">close</i>'+
                '<div>'+
                    '<div class="ml-editor-title">'+
                        '{{ title }}'+
                    '</div>'+
                    '<form>'+
                        '<div ng-repeat="field in fields">'+

                            '<md-input-container class="md-block" ng-if="field.type|inInputTypes">'+
                                '<label>{{ field.label }}</label>'+
                                '<input name="{{ field.model }}" type="{{ field.type }}" ng-model="item[field.model]" ng-required="field.required === true"/>'+
                            '</md-input-container>'+

                            '<md-input-container class="md-block" ng-if="field.type === \'select\'">'+
                                '<label>{{ field.label }}</label>'+
                                '<md-select ng-model="item[field.model]" ng-required="field.required === true">'+
                                    '<md-option ng-repeat="option in getOptions(field)" ng-value="option">{{ getOptionText(field, option) }}</md-option>'+
                                '</md-select>'+
                            '</md-input-container>'+

                            '<div ng-if="field.type == \'date\'">'+
                                '<md-datepicker ng-model="item[field.model]" md-placeholder="{{ field.label }}" ng-required="field.required === true" aria-label="datetime"></md-datepicker>'+
                            '</div>'+

                            '<md-input-container class="md-block" ng-if="field.type == \'textarea\'">'+
                                '<label>{{ field.label }}</label>'+
                                '<textarea ng-model="item[field.model]" columns="1" md-max-length="150"></textarea>'+
                            '</md-input-container>'+

                        '</div>'+

                        '<md-dialog-actions>'+
                            '<md-button class="md-accent md-raised ml-button" ng-click="cancel()">Annuler</md-button>'+
                            '<md-button class="md-primary md-raised ml-button" type="submit" ng-click="ok()">Ok</md-button>'+
                        '</md-dialog-actions>'+

                    '</form>'+
                '</div>'+
            '</md-dialog-content>'+
        '</md-dialog>';

})(angular);