(function(angular) {
    "use strict";

    var module = angular.module('mlResourcesEditor');

    module.factory('mlListDialog', function($rootScope, $mdDialog, $templateCache) {

        var listTemplate = $templateCache.get('mlListTemplate.html');

        var dialogTemplate = "\
            <md-dialog>\
                <md-button ng-click='cancel()' class='md-icon-button ml-close-button'>\
                    <md-icon class='material-icons'>close</md-icon>\
                </md-button>\
                <md-dialog-content class='md-dialog-content'>"+listTemplate+"</md-dialog-content>\
            </md-dialog>";

        return {
            open: function(name) {
                var listScope = $rootScope.$new(true);
                listScope.name = name;
                listScope.mode = 'dialog';
                listScope.cancel = function() {
                    $mdDialog.hide();
                };

                return $mdDialog.show({
                    template: dialogTemplate,
                    controller: 'mlListController',
                    scope: listScope,
                    clickOutsideToClose: true
                });
            }
        };
    });

}(angular));