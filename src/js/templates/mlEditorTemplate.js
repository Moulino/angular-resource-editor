/*jshint multistr: true */
(function(angular) {
    "use strict";

     var editorTemplate ="\
        <md-dialog class=\"ml-editor-template\">\
            <md-toolbar>\
                <div class=\"md-toolbar-tools\">\
                    <span>{{ title }}</span>\
                    <span flex></span>\
                    <md-button ng-click=\"cancel()\">\
                        <md-icon class=\"material-icons\">close</md-icon>\
                    </md-button>\
                </div>\
            </md-toolbar>\
            <md-dialog-content class=\"md-dialog-content\">\
                <form>\
                    <div ng-repeat=\"field in fields\">\
                        <md-input-container ng-if=\"field.type|inInputTypes\">\
                            <label>{{ field.label }}</label>\
                            <input name=\"{{ field.model }}\" type=\"{{ field.type }}\" ng-model=\"item[field.model]\" ng-required=\"field.required === true\"/>\
                        </md-input-container>\
                        <md-input-container ng-if=\"field.type == 'select'\">\
                            <label>{{ field.label }}</label>\
                            <md-select ng-init=\"loadOptions(field)\" placeholder=\"{{ field.label }}\" ng-model=\"item[field.model]\"\">\
                                <md-option ng-value=\"option.value\" ng-repeat=\"option in getOptions(field)\">{{ option.label }}</option>\
                            </md-select>\
                            <md-progress-circular ng-show=\"field.loading\" md-mode=\"indeterminate\" md-diameter=\"30\"></md-progress-circular>\
                        </md-input-container>\
                        <div ng-if=\"field.type == 'date'\">\
                            <label>{{ field.label }}</label>\
                            <md-datepicker ng-model=\"item[field.model]\" md-placeholder=\"{{ field.label }}\" ng-required=\"field.required === true\" aria-label=\"datetime\"></md-datepicker>\
                        </div>\
                        <div ng-if=\"field.type == 'boolean'\">\
                            <md-checkbox ng-model='item[field.model]'>{{field.label}}</md-checkbox>\
                        </div>\
                        <md-input-container ng-if=\"field.type == 'textarea'\">\
                            <label>{{ field.label }}</label>\
                            <textarea ng-model=\"item[field.model]\" columns=\"1\" md-max-length=\"150\"></textarea>\
                        </md-input-container>\
                    </div>\
                    <md-dialog-actions>\
                        <md-button class=\"md-accent md-raised ml-button\" ng-click=\"cancel()\">Annuler</md-button>\
                        <md-button class=\"md-primary md-raised ml-button\" type=\"submit\" ng-click=\"ok()\">Ok</md-button>\
                    </md-dialog-actions>\
                </form>\
            </md-dialog-content>\
        </md-dialog>";

    var module = angular.module('mlResourceEditor');

    module.run(function($templateCache) {
        $templateCache.put('mlEditorTemplate.html', editorTemplate);
    });


}(angular));