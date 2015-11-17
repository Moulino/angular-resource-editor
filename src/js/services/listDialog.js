(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.factory('mlListDialog', function($rootScope, $mdDialog, $templateCache) {

        var listTemplate = $templateCache.get('mlListTemplate.html');

        var dialogTemplate =
            "<md-dialog>"+
            "<i class='md-icon ml-close-button material-icons' ng-click='cancel()'>close</i>"+
            "<md-dialog-content class='md-dialog-content'>"+listTemplate+"</md-dialog-content>"+
            "</md-dialog>";

        return {
            open: function(name) {
                var listScope = $rootScope.$new(true);
                listScope.name = name;
                listScope.mode = 'dialog';

                return $mdDialog.show({
                    template: dialogTemplate,
                    controller: 'mlListController',
                    scope: listScope,
                    clickOutsideToClose: true
                });
            },
            close: function() {
                $mdDialog.hide();
            }
        };
    });

}(angular));