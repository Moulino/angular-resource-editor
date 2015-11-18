describe('mlListDialog factory', function() {
    var $mdDialog,
        $rootScope,
        mlListDialog,
        mlResources;

    var testElement = angular.element('<div>');

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$mdDialog_, _$rootScope_,  _mlListDialog_, _mlResources_) {
        $mdDialog = _$mdDialog_;
        $rootScope = _$rootScope_;
        mlListDialog = _mlListDialog_;
        mlResources = _mlResources_;

        var originalShow = $mdDialog.show; // save the original function
        spyOn($mdDialog, 'show').and.callFake(function(options) {
            options['parent'] = testElement;
            originalShow(options);
        });

        spyOn(mlResources, 'getOptions').and.returnValue({
            title_list: 'test_title_list',
            fields: [
                {label: 'Id', model: 'id', type: 'number'},
                {label: 'Name', model: 'name', type: 'text'}
            ]
        });

        spyOn(mlResources, 'getCollection').and.returnValue(
            [{id: 1, name: 'test1'}, {id: 2, name: 'test2'}]
        );

        spyOn(mlResources, 'createResource');
    }));

    it('open should display the dialog box', function() {
        mlListDialog.open('tasks');
        $rootScope.$apply();

        var mdContent = testElement.find('md-dialog-content');
        var title = mdContent.find('.ml-list-title').text();
        var tbody = mdContent.find('table > tbody');
        var rows = tbody.find('tr');
        var id1 = tbody.find('tr:first-child td:first-child').text();
        var name2 = tbody.find('tr:last-child td:last-child').text();

        expect(title).toEqual('test_title_list');
        expect(rows.length).toEqual(2);
        expect(id1).toEqual('1');
        expect(name2).toEqual('test2');
    });
});