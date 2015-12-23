describe('mlPaginationController', function() {
	var $controller, $scope, mlCollection;

	beforeEach(module('mlResourceEditor'));

	beforeEach(inject(function(_$controller_, _mlCollection_) {
		$controller = _$controller_;
		mlCollection = _mlCollection_;

		$scope = jasmine.createSpyObj('$scope', ['load']);

		$controller('mlPaginationController', {$scope: $scope});
	}));

	it('should init the page number', function() {
		expect($scope.page).toEqual(1);
	});

	describe('first', function() {
		it('should load the first page', function() {
			$scope.page = 3;
			$scope.first();
			expect($scope.page).toEqual(1);
			expect($scope.load).toHaveBeenCalledWith(1);
		});
	});

	describe('next', function() {
		it('should load the next page', function() {
			spyOn(mlCollection, 'getNumberOfPages').and.returnValue(2);
			$scope.page = 1;
			$scope.next();
			expect($scope.page).toEqual(2);
			expect($scope.load).toHaveBeenCalledWith(2);
		});

		it('should do nothing if the current page is the last', function() {
			spyOn(mlCollection, 'getNumberOfPages').and.returnValue(2);
			$scope.page = 2;
			$scope.next();
			expect($scope.page).toEqual(2);
			expect($scope.load).not.toHaveBeenCalled();
		});
	});

	describe('previous', function() {
		it('should load the previous page', function() {
			$scope.page = 2;
			$scope.previous();
			expect($scope.page).toEqual(1);
			expect($scope.load).toHaveBeenCalledWith(1);
		});

		it('should do nothing if the current page is the first', function() {
			$scope.previous();
			expect($scope.page).toEqual(1);
			expect($scope.load).not.toHaveBeenCalled();
		});
	});

	describe('last', function() {
		it('should load the last page', function() {
			spyOn(mlCollection, 'getNumberOfPages').and.returnValue(4);
			$scope.page = 2;
			$scope.last();
			expect($scope.page).toEqual(4);
			expect($scope.load).toHaveBeenCalledWith(4);
		});
	});

	describe('isFirstPage', function() {
		it('should return true if the current page is the first', function() {
			$scope.page = 1;
			expect($scope.isFirstPage()).toBeTrue();
		});

		if('should return false if the current page is not the first', function() {
			$scope.page = 2;
			expect($scope.isFirstPage()).toBeFalse();
		});
	});

	describe('isLastPage', function() {
		it('should return true if the current page is the last', function() {
			spyOn(mlCollection, 'getNumberOfPages').and.returnValue(4);
			$scope.page = 4;
			expect($scope.isLastPage()).toBeTrue();
		});

		if('should return false if the current page is not the last', function() {
			spyOn(mlCollection, 'getNumberOfPages').and.returnValue(4);
			$scope.page = 2;
			expect($scope.isLastPage()).toBeFalse();
		});
	});

	describe('numberOfPages', function() {
		it('should return the number of pages', function() {
			spyOn(mlCollection, 'getNumberOfPages').and.returnValue(4);
			var result = $scope.numberOfPages();
			expect(result).toEqual(4);
		});
	});
});