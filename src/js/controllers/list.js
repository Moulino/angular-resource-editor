(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.controller('mlListController', function($scope, $window, $filter, mlResources, mlEditorDialog, mlListDialog) {
        $scope.items = mlResources.getCollection($scope.name);
        $scope.loading = false;
        $scope.rowSelected = null;
        $scope.options = mlResources.getOptions($scope.name);

        /*
         * Default options for the controller scope
         */
        var defaultOpts = {
            title_list: 'Resource manager',
            title_add: 'Add a resource',
            title_edit: 'Edit a resource',
            question_remove: 'Do you want to remove this resource ?'
        };

        angular.extend($scope, defaultOpts, $scope.options);

        if(angular.isUndefined($scope.mode)) {
            console.error("The mode value must be defined.");
        }

        $scope.itemSelected = function() {
            return ($scope.rowSelected != null) ? $scope.items[$scope.rowSelected] : null;
        };

        $scope.normalizeResources = function(item) {
            var normalized = copy(item);
            // associates the item to an resource for select fields
            angular.forEach($scope.fields, function (field) {
                if (field.type === 'select' && angular.isDefined(field.select_resource)) {
                    var model = field.model;
                    var id = normalized[model].id;

                    angular.forEach(mlResources.getCollection(field.select_resource.collection), function (resource) {
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
                        //mlEditorDialog.close();
                    }, function (err) {
                        console.error(err);
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
                        //mlEditorDialog.close();
                    }, function (err) {
                        console.error(err);
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
                        $scope.rowSelected = null;
                    }, function (err) {
                        console.error(err);
                    });
            }
        };

        $scope.getString = function(field, item) {

            if(angular.isFunction(field.to_string)) {
                return field.to_string(item);
            }

            // converts the date fields
            if(field.type === 'date' && angular.isDefined(field.date_format)) {
                return $filter('date')(item[field.model], field.date_format);
            }

            return item[field.model];
        };

    });

}(angular));