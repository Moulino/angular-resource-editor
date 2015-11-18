(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.directive('mlList', function($controller, $templateCache) {
        var template = $templateCache.get('mlListTemplate.html');

        return {
            restrict: 'A',
            template: template,
            scope: {},
            link: function($scope, $element, $attributes) {
                $scope.name = $attributes.name;
                $scope.mode = 'inline';
                $controller('mlListController', {$scope: $scope});
            }
        };
    });

}(angular));