(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

	module.controller('mlPaginationController', function($scope, mlCollection) {
		$scope.page = 1;

		$scope.first = function() {
			$scope.page = 1;
			$scope.load($scope.page);
		};

		$scope.next = function() {
			if($scope.page < mlCollection.getNumberOfPages($scope.name)) {
				$scope.load(++$scope.page);
			}
		};

		$scope.previous = function() {
			if($scope.page > 1) {
				$scope.load(--$scope.page);
			}
		};

		$scope.last = function() {
			$scope.page = mlCollection.getNumberOfPages($scope.name);
			$scope.load($scope.page);
		};

		$scope.isFirstPage = function() {
			return mlCollection.isFirstPage($scope.name);
		};

		$scope.isLastPage = function() {
			return mlCollection.isLastPage($scope.name);
		};

		$scope.numberOfPages = function() {
			return mlCollection.getNumberOfPages($scope.name);
		};
	});
	
}(angular));