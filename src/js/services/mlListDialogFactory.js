/*jshint multistr: true */
(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.factory('mlListDialog', function($rootScope, $mdDialog, $templateCache) {

        var listTemplate = $templateCache.get('mlListTemplate.html');

        var dialogTemplate = "\
            <md-dialog>\
                <md-toolbar>\
                    <div class=\"md-toolbar-tools\">\
                        <span>{{ title_list }}</span>\
                        <span flex></span>\
                        <md-button ng-click=\"cancel()\">\
                            <md-icon class=\"material-icons\">close</md-icon>\
                        </md-button>\
                    </div>\
                </md-toolbar>\
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