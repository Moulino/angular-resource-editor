(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');
    /*
     * Angular resource transformers for the xhr requests.
     */
    module.factory('mlResourceTransform', function(mlUtils) {
        return {
            request: function(obj) {

                angular.forEach(obj, function (value, key) {
                    if (angular.isObject(value) && angular.isDefined(value.id)) {
                        obj[key] = value.id;
                    }
                });

                return angular.toJson(obj);
            },

            response: function(data) {
                var obj = angular.fromJson(data);

                mlUtils.rDateConvert(obj);
                return obj;
            }
        };
    });

}(angular));
