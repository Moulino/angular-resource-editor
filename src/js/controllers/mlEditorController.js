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