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
                <form name=\"editor\">\
                    <div ng-repeat=\"field in fields\">\
                        <md-input-container ng-if=\"field.type|inInputTypes\" md-auto-hide=\"false\">\
                            <label>{{ field.label }}</label>\
                            <input name=\"{{ field.model }}\" type=\"{{ field.type }}\" ng-model=\"item[field.model]\" ng-required=\"field.ng-required\"/>\
                            <div ng-messages = \"remoteErrors.{{ field.model }}\" ng-hide=\"remoteErrors[field.model].length\">\
                                <div ng-repeat=\"(type, message) in remoteErrors[field.model]\" ng-message=\"{{ type }}\">\
                                    {{ message }}\
                                </div>\
                            </div>\
                        </md-input-container>\
                        <md-input-container ng-if=\"field.type == 'select'\">\
                            <label>{{ field.label }}</label>\
                            <md-select name=\"{{ field.model }}\" ng-init=\"loadOptions(field)\" placeholder=\"{{ field.label }}\" ng-model=\"item[field.model]\" required md-no-asterisk=\"false\">\
                                <md-option ng-value=\"option.value\" ng-repeat=\"option in getOptions(field)\">{{ option.label }}</option>\
                            </md-select>\
                            <md-progress-circular ng-show=\"field.loading\" md-mode=\"indeterminate\" md-diameter=\"30\"></md-progress-circular>\
                            <md-button ng-click='addSubResource(field.select_resource.resource)' class='md-icon-button green'>\
                                <md-icon class='material-icons'>add</md-icon>\
                            </md-button>\
                        </md-input-container>\
                        <div ng-if=\"field.type == 'date'\">\
                            <label>{{ field.label }}</label>\
                            <md-datepicker ng-model=\"item[field.model]\" placeholder=\"{{ field.label }}\" ng-required=\"field.required === true\" aria-label=\"datetime\"></md-datepicker>\
                        </div>\
                        <div ng-if=\"field.type == 'boolean'\">\
                            <md-checkbox ng-model='item[field.model]'>{{field.label}}</md-checkbox>\
                        </div>\
                        <div ng-if=\"field.type == 'radio'\" class='radio'>\
                            <p>{{field.label}}</p>\
                            <md-radio-group ng-model='item[field.model]'>\
                                <md-radio-button ng-repeat='choice in field.choices' value='{{choice.value}}'>{{choice.label}}</md-radio-button>\
                            </md-radio-group>\
                        </div>\
                        <md-input-container ng-if=\"field.type == 'textarea'\">\
                            <label>{{ field.label }}</label>\
                            <textarea ng-model=\"item[field.model]\" columns=\"1\" md-max-length=\"150\"></textarea>\
                            <div ng-messages=\"editor-form.{{ field.model }}.$error\">\
                                <div ng-message=\"required\">Ce champs est requis</div>\
                            </div>\
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