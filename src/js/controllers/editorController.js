(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.controller('mlEditorController', function($scope, $mdDialog, mlResources) {

        $scope.ok = function() {
            $mdDialog.hide($scope.item);
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.getOptions = function (field) {
            if (angular.isDefined(field.select_resource)) {
                return mlResources.getCollection(field.select_resource.collection);
            }
        };

        $scope.getOptionText = function (field, option) {
            var column = field.select_resource.column;
            return option[column];
        };
    });

}(angular));