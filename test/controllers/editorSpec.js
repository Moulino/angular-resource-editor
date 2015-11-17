describe('mlEditorController', function() {
    var $mdDialog,
        $controller,
        mlResources,
        mlEditorController,
        $scope;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$mdDialog_, _$controller_, _mlResources_) {
        $mdDialog = _$mdDialog_;
        $controller = _$controller_;
        mlResources = _mlResources_;
        $scope = {};

        mlEditorController = $controller('mlEditorController', {
            $scope: $scope,
            $mdDialog: $mdDialog,
            mlResources: mlResources
        });
    }));

    it('ok should return the item', function() {
        $scope.item = {id: 1};
        spyOn($mdDialog, 'hide');
        $scope.ok();
        expect($mdDialog.hide).toHaveBeenCalledWith({id: 1});
    });

    it('getOptions return the defined options for submitted field', function() {
        var categoryFixtures = [
            {id: 1, name: 'category1'},
            {id: 2, name: 'category2'}
        ];

        var field = {
            select_resource: {
                collection: 'categories'
            }
        };

        spyOn(mlResources, 'getCollection').and.returnValue(categoryFixtures);

        var options = $scope.getOptions(field);
        expect(options).toEqual(categoryFixtures);
    });

    it('getOptionText should return the option text', function() {
        var field = {select_resource: {column: 'name'}};
        var option = {id: 1, name: 'category1'};

        var text = $scope.getOptionText(field, option);
        expect(text).toEqual('category1');
    });
});