(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    /*
     * Filter the simple types of 'input' (text and number)
     */
    module.filter('inInputTypes', [function () {
        var inputTypes = ['text', 'number'];

        return function (item) {
            for (var i = 0; i < inputTypes.length; i++) {
                if (inputTypes[i] == item) {
                    return true;
                }
            }
            return false;
        };
    }]);

}(angular));