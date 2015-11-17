(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.factory('mlEditorDialog', function($rootScope, $mdDialog, $templateCache, mlResources) {

        var template = $templateCache.get('mlEditorTemplate.html');

        return {
            open: function(name, item) {

                var isAdding = angular.isUndefined(item);
                var options = mlResources.getOptions(name);

                var editorScope = $rootScope.$new(true);
                editorScope.item = (isAdding) ? mlResources.createResource(name) : item;
                editorScope.title = (isAdding) ? options.title_add : options.title_edit;
                editorScope.fields = options.fields;

                return $mdDialog.show({
                    template: template,
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

}(angular));