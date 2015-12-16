(function(angular) {
	"use strict";

	var module = angular.module('mlResourcesEditor');

	module.controller('mlListController', function($scope, $window, $filter, mlCollections, mlResources, mlEditorDialog, mlListDialog) {
		$scope.items = [];
		$scope.rowSelected = null;

		$scope.mode = $scope.mode || 'inline';
		$scope.test = $scope.test || false; // for tests only
		
		angular.merge($scope, mlResources.getOptions($scope.name));

		var isDialog = function() {
			return $scope.mode === 'dialog';
		};

		$scope.load = function(page) {
			page = page || 1;

			$scope.loading = true;
			$scope.items = mlCollections.getList($scope.name);
			mlCollections.load($scope.name, page).finally(function() {
				$scope.loading = false;
			});
		};

		$scope.reload = function() {
			$scope.loading = true;
			mlCollections.reload($scope.name).finally(function() {
				$scope.loading = false;
			});
		};

		$scope.itemSelected = function() {
            return ($scope.rowSelected != null) ? $scope.items[$scope.rowSelected] : null;
        };

		$scope.add = function() {
			mlEditorDialog.open($scope.name).then(function(item) {
				mlCollections.getCollection($scope.name).post(item).then(function() {
					$scope.reload();
					if(isDialog()) {
						mlListDialog.open($scope.name);
					}
				}, function(response) {
					$window.alert(response["hydra:description"]);
					$scope.add();
				});
			});
		};

		$scope.edit = function() {
			var item = $scope.itemSelected();

			if(null != item) {
				mlEditorDialog.open($scope.name, item).then(function() {
					item.save().then(function() {
						$scope.reload();
					}, function(response) {
						$window.alert(response["hydra:description"]);
						$scope.edit();
					});
				}).finally(function() {
					if(isDialog()) {
						mlListDialog.open($scope.name);
					}
				});
			}
		};

		$scope.remove = function() {
			var item = $scope.itemSelected();

			if($window.confirm($scope.question_remove)) {			
				if(null != item) {
					item.remove().then(function() {
						$scope.reload();
					}, function(response) {
						$window.alert(response["hydra:description"]);
					});
				}
			}
		};
		
		$scope.getString = function(field, item) {

            if(angular.isFunction(field.to_string)) {
            	if('select' == field.type) {
            		return field.to_string(item['_'+field.model]);
            	} else {
            		return field.to_string(item[field.model]);
            	}
            }

            // converts the date fields
            if(field.type === 'date' && angular.isDefined(field.date_format)) {
                return $filter('date')(item[field.model], field.date_format);
            }

            return item[field.model];
        };

        if(false === $scope.test) {
        	$scope.load();
        }
	});

}(angular));