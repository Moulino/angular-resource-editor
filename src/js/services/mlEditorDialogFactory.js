(function(angular) {
    "use strict";

    var module = angular.module('mlResourcesEditor');

    module.factory('mlEditorDialog', function($rootScope, $mdDialog, $templateCache, mlResources) {

        var template = $templateCache.get('mlEditorTemplate.html');

        return {
            open: function(name, item) {

                var isAdding = angular.isUndefined(item);
                var options = mlResources.getOptions(name);

                var editorScope = $rootScope.$new(true);
                editorScope.name = name;
                editorScope.options = mlResources.getOptions(name);
                editorScope.item = (isAdding) ? mlResources.createResource(name) : item;
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