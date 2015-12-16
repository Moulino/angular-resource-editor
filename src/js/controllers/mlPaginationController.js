(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.controller('mlPaginationController', function($scope, mlCollections) {
		$scope.page = 1;

		$scope.first = function() {
			$scope.page = 1;
			$scope.load($scope.page);
		};

		$scope.next = function() {
			if($scope.page < mlCollections.getNumberOfPages($scope.name)) {
				$scope.load(++$scope.page);
			}
		};

		$scope.previous = function() {
			if($scope.page > 1) {
				$scope.load(--$scope.page);
			}
		};

		$scope.last = function() {
			$scope.page = mlCollections.getNumberOfPages($scope.name);
			$scope.load($scope.page);
		};

		$scope.isFirstPage = function() {
			return mlCollections.isFirstPage($scope.name);
		};

		$scope.isLastPage = function() {
			return mlCollections.isLastPage($scope.name);
		};

		$scope.numberOfPages = function() {
			return mlCollections.getNumberOfPages($scope.name);
		};
	});
	
}(angular));