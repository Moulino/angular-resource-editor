describe('mlList directive', function() {
    var $compile,
        $rootScope,
        mlResources;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _mlResources_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        mlResources = _mlResources_;
    }));

    it('should include list template', function() {
        var node = $compile("<div ml-list name='tasks'></div>")($rootScope);
        $rootScope.$digest();

        expect(node).toContainElement('.ml-list');

        var scope = node.isolateScope();
        expect(scope).toHaveMember('name');
        expect(scope.name).toEqual('tasks');
    });

    it('should display items', function() {
        spyOn(mlResources, 'getOptions').and.returnValue({
            fields: [
                {label: 'Id', model: 'id', type: 'number'},
                {label: 'Name', model: 'name',type: 'text'}
            ]
        });
        spyOn(mlResources, 'getCollection').and.returnValue([
            {id: 1, name: 'task1'},
            {id: 2, name: 'task2'}
        ]);

        var node = $compile("<div ml-list name='tasks'></div>")($rootScope);
        $rootScope.$digest();

        expect(node.find('tbody>tr')).toHaveLength(2);
        expect(node.find('tbody>tr:first-child>td:first-child')).toHaveText(1);
        expect(node.find('tbody>tr:last-child>td:last-child')).toHaveText('task2');
    });

    it('should display title', function() {
        spyOn(mlResources, 'getOptions').and.returnValue({
            title_list: 'Test_title'
        });
        spyOn(mlResources, 'getCollection').and.returnValue([]);

        var node = $compile("<div ml-list name='tasks'></div>")($rootScope);
        $rootScope.$digest();

        expect(node.find('.ml-list-title')).toHaveText('Test_title');
    });
});