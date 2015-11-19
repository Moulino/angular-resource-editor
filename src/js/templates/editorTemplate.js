(function(angular) {
    "use strict";

     var editorTemplate =
        '<md-dialog>'+
            '<md-dialog-content class="md-dialog-content">'+
                '<i class="md-icon ml-close-button material-icons" ng-click="cancel()">close</i>'+
                '<div>'+
                    '<div class="ml-editor-title">'+
                        '{{ title }}'+
                    '</div>'+
                    '<form>'+
                        '<div ng-repeat="field in fields">'+

                            '<md-input-container class="md-block" ng-if="field.type|inInputTypes">'+
                                '<label>{{ field.label }}</label>'+
                                '<input name="{{ field.model }}" type="{{ field.type }}" ng-model="item[field.model]" ng-required="field.required === true"/>'+
                            '</md-input-container>'+

                            '<md-input-container class="md-block" ng-if="field.type === \'select\'">'+
                                '<label>{{ field.label }}</label>'+
                                '<md-select ng-model="item[field.model]" ng-required="field.required === true">'+
                                    '<md-option ng-repeat="option in getOptions(field)" ng-value="option">{{ getOptionText(field, option) }}</md-option>'+
                                '</md-select>'+
                            '</md-input-container>'+

                            '<div ng-if="field.type == \'date\'">'+
                                '<md-datepicker ng-model="item[field.model]" md-placeholder="{{ field.label }}" ng-required="field.required === true" aria-label="datetime"></md-datepicker>'+
                            '</div>'+

                            '<md-input-container class="md-block" ng-if="field.type == \'textarea\'">'+
                                '<label>{{ field.label }}</label>'+
                                '<textarea ng-model="item[field.model]" columns="1" md-max-length="150"></textarea>'+
                            '</md-input-container>'+

                        '</div>'+

                        '<md-dialog-actions>'+
                            '<md-button class="md-accent md-raised ml-button" ng-click="cancel()">Annuler</md-button>'+
                            '<md-button class="md-primary md-raised ml-button" type="submit" ng-click="ok()">Ok</md-button>'+
                        '</md-dialog-actions>'+

                    '</form>'+
                '</div>'+
            '</md-dialog-content>'+
        '</md-dialog>';

    var module = angular.module('mlResourceEditor');

    module.run(function($templateCache) {
        $templateCache.put('mlEditorTemplate.html', editorTemplate);
    });


}(angular));