(function(angular) {
    'use strict';

    var template =
        "<div class='ml-list'>\
            <table ml-list-selection>\
                <caption>\
                    <div layout='row' layout-align='end center' class='ml-list-actions'>\
                        <md-button ng-click='add()' class='md-icon-button green'>\
                            <md-icon class='material-icons'>add</md-icon>\
                        </md-button>\
                        <md-button ng-click='edit()' ng-disabled='rowSelected == null' class='md-icon-button yellow'>\
                            <md-icon class='material-icons'>create</md-icon>\
                        </md-button>\
                        <md-button ng-click='remove()' ng-disabled='rowSelected == null' class='md-icon-button red'>\
                            <md-icon class='material-icons'>delete</md-icon>\
                        </md-button>\
                    </div>\
                </caption>\
                <thead>\
                    <tr>\
                        <th ng-repeat='field in fields'>{{ field.label }}</th>\
                    </tr>\
                </thead>\
                <tbody>\
                    <tr ng-if='loading'>\
                        <td colspan='{{ fields.length }}'>\
                            <div layout='row' layout-align='center center'>\
                                <md-progress-circular md-mode='indeterminate'></md-progress-circular>\
                            </div>\
                        </td>\
                    </tr>\
                    <tr ng-if='!loading' ng-repeat='item in items'>\
                        <td ng-repeat='field in fields'>{{ getString(field, item) }}</td>\
                    </tr>\
                </tbody>\
            </table>\
            <div ml-pagination></div>\
        </div>";

    var module = angular.module('mlResourcesEditor');

    module.run(function($templateCache) {
        $templateCache.put('mlListTemplate.html', template);
    });

}(angular));