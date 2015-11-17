(function(angular) {
    "use strict";

    var template =
        '<div class="ml-list">'+
            '<div>'+
                '<table ml-list-selection>'+
                    '<caption>'+
                        '<span class="ml-list-title">'+
                            '{{ title_list }}'+
                        '</span>'+
                        '<div class="ml-list-actions">'+
                            '<i class="md-icon material-icons green" ng-click="add()">add</i>'+
                            '<i class="md-icon material-icons yellow" ng-disabled="rowSelected == null" ng-click="edit()">create</i>'+
                            '<i class="md-icon material-icons red" ng-disabled="rowSelected == null" ng-click="remove()">delete</i>'+
                        '</div>'+
                    '</caption>'+
                    '<thead>'+
                        '<tr>'+
                            '<th ng-repeat="field in fields">{{ field.label }}</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                        '<tr ng-repeat="item in items">'+
                            '<td ng-repeat="field in fields">{{ getString(field, item) }}</td>'+
                        '</tr>'+
                    '</tbody>'+
                '</table>'+
            '</div>'+
        '</div>';

    var module = angular.module('mlResourceEditor');

    module.run(function($templateCache) {
        $templateCache.put('mlListTemplate.html', template);
    });

}(angular));