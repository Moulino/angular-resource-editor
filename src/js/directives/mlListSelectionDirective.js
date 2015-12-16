(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.directive('mlListSelection', function() {
		return {
			restrict: 'A',
			link: function(scope, element) {
				element.find('tbody').on('click', 'tr', function () {

                    $(this).siblings('.selected').removeClass('selected');

                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('selected');
                        scope.rowSelected = null;
                    } else {
                        $(this).addClass('selected');
                        scope.rowSelected = $(this).index();
                    }
                    scope.$apply();
                });
			}
		}
	});

}(angular));