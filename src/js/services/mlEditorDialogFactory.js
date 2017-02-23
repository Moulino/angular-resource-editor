    (function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.factory('mlEditorDialog', function($rootScope, $mdDialog, $templateCache, mlResource) {

        var template = $templateCache.get('mlEditorTemplate.html');

        return {
            open: function(name, item) {

                var isAdding = true;

                if(angular.isDefined(item)) {
                    if(angular.isDefined(item.id)) {
                        isAdding = false;
                    }
                }
                var options = mlResource.getOptions(name);

                var editorScope = $rootScope.$new(true);
                editorScope.name = name;
                editorScope.options = mlResource.getOptions(name);
                editorScope.item = angular.extend({}, mlResource.createResource(name), item);
                editorScope.title = (isAdding) ? options.title_add : options.title_edit;

                return $mdDialog.show({
                    template: template,
                    controller: 'mlEditorController',
                    scope: editorScope,
                    clickOutsideToClose: true,
                    preserveScope: true
                });
            }
        };
    });

}(angular));