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
           request: function(data) {
               var obj = toJson(data);

               forEach(obj, function (value, key) {
                   if (isObject(value) && isDefined(value.id)) {
                       obj[key] = value.id;
                   }
               });

               return obj;
           },

            response: function(data) {
                var obj = fromJson(data);

                mlUtils.rDateConvert(obj);
                return obj;
            }
        };
    });

    /*
     * This service manages resources, collections and parameters.
     * It is configurable through the 'addResource' method from the provider.
     */
    module.provider('mlResources', function () {
        var resources = this.resources = {};
        var collections = this.collections = {};
        var options = this.options = {};
        var self = this;

        this.addResource = function (opts) {
            var name = opts.name;
            options[name] = opts;
        };



        this.$get = function ($resource, $window, $rootScope, $mdDialog, mlResourceTransform) {
            var templateDialog =
                '<md-dialog class="md-dialog ml-resource-dialog">'+
                    '<md-dialog-content class="md-dialog-content">'+
                        '<div ng-hide="item">'+templateList+'</div>'+
                        '<div ng-show="item" ml-resource-form></div>'+
                    '</md-dialog-content>'+
                '</md-dialog>';

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

                displayInDialog: function (name) {
                    var options = service.getOptions(name);

                    var scope = (isDefined(options.scope)) ? options.scope : $rootScope.$new();

                    extend(scope, defaultOpts, options);
                    if (isDefined(scope.scope)) scope.scope = undefined;

                    scope.formIsDialog = false; // the edition form will be displaying inline

                    scope.close = function() {
                        $mdDialog.hide();
                    };

                    $mdDialog.show({
                        template: templateDialog,
                        controller: 'mlEditorController',
                        scope: scope,
                        locals: {
                            name: name,
                            inline: false
                        },
                        clickOutsideToClose: true
                    });
                }
            };
            return service;
        };
    });

    module.factory('mlFormDialog', function ($mdDialog) {

        var service = {
            open: function ($scope) {
                var template =
                    '<md-dialog class="md-dialog ml-resource-dialog">' +
                        '<md-dialog-content class="md-dialog-content">' + templateForm + '</md-dialog-content>' +
                    '</md-dialog>';

                $mdDialog.show({
                    template: template,
                    controller: 'mlFormController',
                    clickOutsideToClose: true,
                    scope: $scope,
                    preserveScope: true
                });
            },
            close: function () {
                $mdDialog.hide();
            }
        };

        return service;
    });

    module.directive('mlResourceEditor', function($controller) {

        return {
            restrict: 'A',
            template: templateList,
            link: function (scope, elem, attrs) {
                var resource = attrs.name;

                scope.formIsDialog = true; // the edition form will be displaying in dialog

                var locals = {
                    $scope: scope,
                    name: resource,
                    inline: true
                };

                $controller('mlEditorController', locals);
            }
        }
    });

    /* Directive for manage the row selection in the resource list */
    module.directive('mlResourceList', function () {

        return {
            restrict: 'A',
            link: function (scope, elem) {

                scope.itemSelected = function() {
                    return (scope.rowSelected != null) ? scope.items[scope.rowSelected] : null;
                };

                elem.find('tbody').on('click', 'tr', function () {

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

    module.directive('mlResourceForm', function() {
        return {
            restrict: 'A',
            template: templateForm,
            controller: 'mlFormController'
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

    module.controller('mlEditorController', function ($scope, $window, $filter, mlResources, mlFormDialog, name, inline) {

        var Resource = mlResources.getResource(name);
        var options = mlResources.getOptions(name);

        $scope.item = null;
        $scope.items = mlResources.getCollection(name);
        $scope.loading = false;
        $scope.rowSelected = null;
        $scope.inline = inline;
        $scope.options = options;
        $scope.form_title = '';
        $scope.name = name;

        extend($scope, defaultOpts, options);

        this.create = function() {
            var item = new Resource();
            forEach($scope.fields, function(field) {
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
        };

        var self = this;

        // creates a new object resource
        $scope.add = function () {
            $scope.form_title = $scope.title_add;
            $scope.item = self.create();

            if(true === inline) {
                mlFormDialog.open($scope);
            }
        };

        // edits the resource object currently selected
        $scope.edit = function () {
            $scope.form_title = $scope.title_edit;
            $scope.item = copy($scope.itemSelected());

            // associates the item to an resource for select fields
            forEach($scope.fields, function (field) {
                if (field.type === 'select' && isDefined(field.select_resource)) {
                    var model = field.model;
                    var id = $scope.item[model].id;

                    forEach(mlResources.getCollection(field.select_resource.collection), function (resource) {
                        if (resource.id === id) {
                            $scope.item[model] = resource;
                        }
                    });
                }
            });

            if(true === inline) {
                mlFormDialog.open($scope);
            }
        };

        // removes the resource object currently selected
        $scope.remove = function () {

            if ($window.confirm($scope.question_remove) === true) {
                var item = $scope.itemSelected();
                item.$remove()
                    .then(function () {
                        CollectionHandler.load();
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

    module.controller('mlFormController', function($scope, mlResources, mlFormDialog) {
        // disable the add or edit action
        var close = function() {
            $scope.item = null;

            if(true === $scope.formIsDialog) {
                mlFormDialog.close();
            }
        };

        // sets the title
        //$scope.form_title = isDefined($scope.item.id) ? $scope.options.title_edit : $scope.options.title_add;

        $scope.cancel = close;

        // submits the add or edit request
        $scope.submit = function() {

            if (angular.isDefined($scope.item.id)) { // if id is defined, then the request is an edition
                $scope.item.$update()
                    .then(function () {
                        mlResources.load($scope.name);
                        $scope.rowSelected = null;
                        close();
                    }, function (err) {
                        console.log(err);
                    });

            } else { // else the request is an addition
                $scope.item.$save()
                    .then(function () {
                        mlResources.load($scope.name);
                        close();
                    }, function (err) {
                        console.log(err);
                    });
            }
        };

        $scope.getOptions = function (field) {
            if (isDefined(field.select_resource)) {
                return mlResources.getCollection(field.select_resource.collection);
            }
        };

        $scope.getOptionText = function (field, option) {
            var options = mlResources.getOptions(field);
            var column = field.select_resource.column;
            return option[column];
        };
    });

    var templateList =
        '<i ng-if="inline != true" class="md-icon rm-close material-icons" ng-click="close()">close</i>'+

        '<div class="ml-resource-list">'+
            '<div>'+
                '<table ml-resource-list>'+
                    '<caption>'+
                        '<span class="ml-list-title">'+
                            '{{ title_list }} '+
                            '<span class="loading" ng-show="loading">( Chargement en cours ... )</span>'+
                        '</span>'+
                        '<div class="rm-table-actions">'+
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
            '<div ng-if="isDialog" class="md-actions">'+
                '<md-button ng-click="hide()" class="md-primary md-raised rm-button">Fermer</md-button>'+
            '</div>'+
        '</div>';

    var templateForm =
        '<i ng-if="inline != true" class="md-icon rm-close material-icons" ng-click="close()">close</i>'+
        '<div class="ml-form-title">'+
            '{{ form_title }}'+
        '</div>'+
        '<form name="rscform">'+
            '<div ng-repeat="field in fields">'+

                '<md-input-container class="md-block" ng-if="field.type|inInputTypes">'+
                    '<label>{{ field.label }}</label>'+
                    '<input name="{{ field.model }}" type="{{ field.type }}" ng-model="item[field.model]" ng-required="field.required === true"/>'+
                '</md-input-container>'+

                '<md-input-container class="md-block" ng-if="field.type == \'select\'">'+
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

            '<div class="md-actions">'+
                '<md-button class="md-accent md-raised rm-button" ng-click="cancel()">Annuler</md-button>'+
                '<md-button class="md-primary md-raised rm-button" type="submit" ng-click="submit()">Ok</md-button>'+
            '</div>'+

        '</form>';

})(angular);