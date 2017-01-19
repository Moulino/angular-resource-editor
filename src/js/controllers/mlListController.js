(function(angular) {
	"use strict";

	var module = angular.module('mlResourceEditor');

	module.controller('mlListController', function($scope, $window, $filter, mlCollection, mlResource, mlEditorDialog, mlListDialog) {
		$scope.items = [];
		$scope.rowSelected = null;

		$scope.mode = $scope.mode || 'inline';
		$scope.test = $scope.test || false; // for tests only
		
		angular.merge($scope, mlResource.getOptions($scope.name));

		var isDialog = function() {
			return $scope.mode === 'dialog';
		};

		$scope.load = function(page) {
			page = page || 1;

			$scope.loading = true;
			$scope.items = mlCollection.get($scope.name);
			mlCollection.load($scope.name, page).finally(function() {
				$scope.loading = false;
			});
		};

		/*
		 * Reload the collection at the same page
		 */
		$scope.reload = function() {
			$scope.loading = true;
			mlCollection.reload($scope.name).finally(function() {
				$scope.loading = false;
			});
		};

		$scope.itemSelected = function() {
            return ($scope.rowSelected !== null) ? $scope.items[$scope.rowSelected] : null;
        };

		$scope.add = function() {
			mlEditorDialog.open($scope.name).then(function successCallback(item) {
				mlCollection.getResource($scope.name).save(item, function() {
					$scope.reload();
					if(isDialog()) {
						mlListDialog.open($scope.name);
					}
				}, function(response) {
					alert(response.data["hydra:description"]);
					$scope.add();
				});
			}, function cancelCallback() {
				if(isDialog()) {
					mlListDialog.open($scope.name);
				}
			});
		};

		$scope.edit = function() {
			var item = $scope.itemSelected();

			if(null !== item) {
				mlEditorDialog.open($scope.name, angular.copy(item)).then(function successCallback(itemUpd) {
					itemUpd.$update(function() {
						$scope.reload();
					}, function(response) {
						$window.alert(response.data["hydra:description"]);
						$scope.edit();
					});
				}, function cancelCallback() {
					if(isDialog()) {
						mlListDialog.open($scope.name);
					}
				});
			}
		};

		$scope.remove = function() {
			if($window.confirm($scope.question_remove)) {
				var item = $scope.itemSelected();		
				if(null !== item) {
					item.$delete().then(function() {
						$scope.reload();
					}, function(response) {
						$window.alert(response.data["hydra:description"]);
					});
				}
			}
		};
		
		$scope.getString = function(field, item) {

            if(angular.isFunction(field.to_string)) {
            	return field.to_string(item[field.model]);
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