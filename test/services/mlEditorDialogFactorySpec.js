describe('mlEditorDialog factory', function() {
    var $mdDialog,
        $rootScope,
        mlEditorDialog,
        mlResources,
        testElement;


    beforeEach(module('mlResourcesEditor'));

    beforeEach(inject(function(_$mdDialog_, _$rootScope_,  _mlEditorDialog_, _mlResources_) {
        $mdDialog = _$mdDialog_;
        $rootScope = _$rootScope_;
        mlEditorDialog = _mlEditorDialog_;
        mlResources = _mlResources_;

        testElement = angular.element('<div>');

        var originalShow = $mdDialog.show; // save the original function
        spyOn($mdDialog, 'show').and.callFake(function(options) {
            options['parent'] = testElement;
            originalShow(options);
        });

        spyOn(mlResources, 'getOptions').and.returnValue({
            title_add: 'test_title_add',
            title_edit: 'test_title_edit',
            fields: []
        });

        spyOn(mlResources, 'createResource');
    }));

    it('open should display dialog', function() {
        mlEditorDialog.open('tasks');
        expect($mdDialog.show).toHaveBeenCalled();
    });

    it('open should display a dialog for adding an item', function() {

        mlEditorDialog.open('tasks');
        $rootScope.$apply();

        var mdContent = testElement.find('md-dialog-content');
        var title = mdContent.find('.ml-editor-title').text();

        expect(title).toEqual('test_title_add');
    });

    it('open should display a dialog for editing an item', function() {

        mlEditorDialog.open('tasks', {id: 1});
        $rootScope.$apply();

        var mdContent = testElement.find('md-dialog-content');
        var title = mdContent.find('.ml-editor-title').text();

        expect(title).toEqual('test_title_edit');
    });
});