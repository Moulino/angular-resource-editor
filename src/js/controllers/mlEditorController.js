(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    var isDefined = angular.isDefined,
        isObject = angular.isObject;

    module.controller('mlEditorController', function($scope, $q, $window, $mdDialog, mlCollection, mlResource, mlEditorDialog) {
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