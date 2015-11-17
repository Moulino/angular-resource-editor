(function(angular) {
    "use strict";

    var module = angular.module('mlResourceEditor');

    module.factory('mlUtils', function() {
        var service = {

            /*
             * Converts dates by traversing the object or array recursively
             */
            rDateConvert: function(obj) {
                angular.forEach(obj, function(value, key) {
                    if(angular.isObject(value)) {
                        service.rDateConvert(value);
                    }

                    else if(angular.isString(value)) {
                        var date = new Date(value);

                        if(!isNaN(date.getDate())) {
                            obj[key] = date;
                        }
                    }
                });
            }
        };

        return service;
    });

}(angular));