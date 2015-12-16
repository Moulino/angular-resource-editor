describe('mlPaginationController', function() {
	var $controller, $scope, mlCollections;

	beforeEach(module('mlResourcesEditor'));

	beforeEach(inject(function(_$controller_, _mlCollections_) {
		$controller = _$controller_;
		mlCollections = _mlCollections_;

		$scope = {};
		$scope.load = jasmine.createSpy();

		$controller('mlPaginationController', {$scope: $scope});
	}));

	describe('first', function() {
		it('should load first page', function() {
			$scope.page = 2;
			$scope.first();
			expect($scope.load).toHaveBeenCalledWith(1);
		});
	});

	describe('next', function() {
		it('should load next page', function() {
			$scope.page = 3;

			spyOn(mlCollections, 'getNumberOfPages').and.returnValue(4);

			$scope.next();
			expect($scope.load).toHaveBeenCalledWith(4);
		});

		it('should not load page if it is greater or equal to number of pages', function() {
			$scope.page = 3;

			spyOn(mlCollections, 'getNumberOfPages').and.returnValue(3);

			$scope.next();
			expect($scope.load.calls.any()).toBe(false);
		});
	});

	describe('previous', function() {
		it('should load previous page', function() {
			$scope.page = 3;

			$scope.previous();
			expect($scope.load).toHaveBeenCalledWith(2);
		});

		it('should not load page if it is less or equal to one', function() {
			$scope.page = 1;
			$scope.previous();
			expect($scope.load.calls.any()).toBe(false);

			$scope.page = 0;
			$scope.previous();
			expect($scope.load.calls.any()).toBe(false);

			$scope.page = -1;
			$scope.previous();
			expect($scope.load.calls.any()).toBe(false);
		});
	});

	describe('last', function() {
		it('should load the last page', function() {
			spyOn(mlCollections, 'getNumberOfPages').and.returnValue(4);
			$scope.last();

			expect($scope.page).toEqual(4);
			expect($scope.load).toHaveBeenCalledWith(4);
		});
	});

	describe('isFirstPage', function() {
		it('should return true', function() {
			spyOn(mlCollections, 'isFirstPage').and.returnValue(true);
			expect($scope.isFirstPage()).toBe(true);
		});	

		it('should return false', function() {
			spyOn(mlCollections, 'isFirstPage').and.returnValue(false);
			expect($scope.isFirstPage()).toBe(false);
		});
	});
	
	describe('isLastPage', function() {
		it('should return true', function() {
			spyOn(mlCollections, 'isLastPage').and.returnValue(true);
			expect($scope.isLastPage()).toBe(true);
		});	

		it('should return false', function() {
			spyOn(mlCollections, 'isLastPage').and.returnValue(false);
			expect($scope.isLastPage()).toBe(false);
		});
	});

	describe('numberOfPages', function() {
		it('should return the number of pages', function() {
			spyOn(mlCollections, 'getNumberOfPages').and.returnValue(5);
			expect($scope.numberOfPages()).toEqual(5);
		});	
	});
});