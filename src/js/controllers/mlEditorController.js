(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    var isDefined = angular.isDefined,
        isObject = angular.isObject;

    module.controller('mlEditorController', function($scope, $window, $mdDialog, mlCollection, mlResource) {

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

                field.select_options = [];
                field.loading = true;
                mlResource.get(field.select_resource.resource).getList(params)
                    .then(function(response) {
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

                    }, function(response) {
                        $window.alert(response['hydra:description']);
                    }).finally(function() {
                        field.loading = false;
                    });
            }
        };
    });

}(angular));