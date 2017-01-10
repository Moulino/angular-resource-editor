/*jshint multistr: true */
(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

	module.directive('mlPagination', function() {
		return {
			require: '^ml-list',
			restrict: 'A',
			transclude: true,
			controller: 'mlPaginationController',
			template: "\
				<div layout='row' layout-sm='column' layout-align='center center' class='ml-pagination'>\
					<md-button ng-click='first()' ng-disabled='isFirstPage()' class='md-primary'>Début</md-button>\
					<md-button ng-click='previous()' ng-disabled='isFirstPage()' class='md-primary md-icon-button'>\
						<md-icon class='material-icons'>keyboard_arrow_left</md-icon>\
					</md-button>\
					<span class='pagination-pages'>{{ page }} - {{ numberOfPages() }}</span>\
					<md-button ng-click='next()' ng-disabled='isLastPage()' class='md-primary md-icon-button'>\
						<md-icon class='material-icons'>keyboard_arrow_right</md-icon>\
					</md-button>\
					<md-button ng-click='last()' ng-disabled='isLastPage()' class='md-primary'>Fin</md-button>\
				</div>"
		};
	});

}(angular));