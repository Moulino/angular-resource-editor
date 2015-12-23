describe('mlList directive', function() {
    var $compile,
        $rootScope,
        $directiveScope,
        node;

    beforeEach(module('mlResourceEditor', function($controllerProvider) {
        $controllerProvider.register('mlListController', function($scope) {
            // mock controller 
            $scope.fields = [
                {label: 'Id', model: 'id', type: 'number'},
                {label: 'Name', model: 'name', type: 'text'}
            ];

            $scope.items = [
                {id: 1, name: 'task1'},
                {id: 2, name: 'task2'}
            ];

            $scope.getString = function(field, item) {
                return item[field.model];
            };

            $scope.loading = false;
        });
    }));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        node = $compile("<div ml-list name='tasks'></div>")($rootScope);
        $directiveScope = node.isolateScope();
        $directiveScope.$digest();
    }));

    it('should include list template', function() {
        expect(node).toContainElement('.ml-list');
    });

    it('should display headers', function() {
        expect(node.find('thead th:first-child')).toHaveText('Id');
    });

    it('should display the items', function() {
        expect(node.find('tbody>tr')).toHaveLength(2);
        expect(node.find('tbody>tr:first-child>td:first-child')).toHaveText('1');
        expect(node.find('tbody>tr:last-child>td:last-child')).toHaveText('task2');
    });

    it('should display loading row', function() {
        $directiveScope.loading = true;
        $rootScope.$digest();

        expect(node.find('tbody > tr:first-child')).toContainElement('md-progress-circular');
    });

    it('should call add action', function(){
        $directiveScope.add = jasmine.createSpy('add');
        $rootScope.$digest();

        expect($directiveScope.add).not.toHaveBeenCalled();
        node.find('caption button').eq(0).triggerHandler('click');
        expect($directiveScope.add).toHaveBeenCalled();
    });

    it('should call edit action', function() {
        $directiveScope.edit = jasmine.createSpy('edit');
        $rootScope.$digest();

        expect($directiveScope.edit).not.toHaveBeenCalled();
        node.find('caption button').eq(1).triggerHandler('click');
        expect($directiveScope.edit).toHaveBeenCalled();
    });

    it('should call remove action', function() {
        $directiveScope.remove = jasmine.createSpy('remove');
        $rootScope.$digest();

        expect($directiveScope.remove).not.toHaveBeenCalled();
        node.find('caption button').eq(2).triggerHandler('click');
        expect($directiveScope.remove).toHaveBeenCalled();
    });
});