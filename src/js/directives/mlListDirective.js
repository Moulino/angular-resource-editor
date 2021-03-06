(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

	module.directive('mlList', function($templateCache) {
		var listTemplate = $templateCache.get('mlListTemplate.html');

		return {
			restrict: 'A',
			controller: 'mlListController',
			scope: {
				name: '@'
			},
			template: listTemplate
		};
	});

}(angular));