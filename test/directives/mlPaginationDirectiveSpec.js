describe('mlPagination directive', function() {

	var $rootScope,
		scope,
		node;

	beforeEach(module('mlResourceEditor', function($controllerProvider) {

		// mock controller
		$controllerProvider.register('mlPaginationController', function($scope) {});
	}));

	beforeEach(inject(function(_$rootScope_, $compile) {
		$rootScope = _$rootScope_;

		scope = $rootScope.$new();

		node = $compile("<div ml-pagination></div>")(scope);
	}));

	it('should add buttons', function() {
		expect(node.find('button')).toHaveLength(4);
	});

	it('should load first page when click on button', function() {
		scope.first = jasmine.createSpy('first');

		expect(scope.first).not.toHaveBeenCalled();
		node.find('button').eq(0).triggerHandler('click');
		expect(scope.first).toHaveBeenCalled();
	});

	it('should load previous page when click on button', function() {
		scope.previous = jasmine.createSpy('previous');

		expect(scope.previous).not.toHaveBeenCalled();
		node.find('button').eq(1).triggerHandler('click');
		expect(scope.previous).toHaveBeenCalled();
	});

	it('should load next page when click on button', function() {
		scope.next = jasmine.createSpy('previous');

		expect(scope.next).not.toHaveBeenCalled();
		node.find('button').eq(2).triggerHandler('click');
		expect(scope.next).toHaveBeenCalled();
	});

	it('should load last page when click on button', function() {
		scope.last = jasmine.createSpy('previous');

		expect(scope.last).not.toHaveBeenCalled();
		node.find('button').eq(3).triggerHandler('click');
		expect(scope.last).toHaveBeenCalled();
	});

	it('should display the number of the page', function() {
		scope.page = 2;
		scope.numberOfPages = jasmine.createSpy('numberOfPages').and.returnValue(4);
		scope.$digest();

		expect(node.find('span.pagination-pages')).toHaveText('2 - 4');
	});

	it('should disable buttons', function() {
		scope.isFirstPage = jasmine.createSpy('isFirstPage').and.returnValue(true);
		scope.isLastPage = jasmine.createSpy('isLastPage').and.returnValue(false);
		scope.$digest();

		expect(node.find('button').eq(0)).toHaveAttr('disabled', 'disabled');
		expect(node.find('button').eq(1)).toHaveAttr('disabled', 'disabled');
		expect(node.find('button').eq(2)).not.toHaveAttr('disabled', 'disabled');
		expect(node.find('button').eq(3)).not.toHaveAttr('disabled', 'disabled');

		scope.isFirstPage = jasmine.createSpy('isFirstPage').and.returnValue(false);
		scope.isLastPage = jasmine.createSpy('isLastPage').and.returnValue(true);
		scope.$digest();

		expect(node.find('button').eq(0)).not.toHaveAttr('disabled', 'disabled');
		expect(node.find('button').eq(1)).not.toHaveAttr('disabled', 'disabled');
		expect(node.find('button').eq(2)).toHaveAttr('disabled', 'disabled');
		expect(node.find('button').eq(3)).toHaveAttr('disabled', 'disabled');
	});
});