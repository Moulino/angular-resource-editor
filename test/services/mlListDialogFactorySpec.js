describe('mlListDialog factory', function() {
    var scope;

    var testElement = angular.element('<div>');

    beforeEach(module('mlResourceEditor', function($controllerProvider) {
        $controllerProvider.register('mlListController', function($scope) {
            scope = $scope;
        })
    }));

    describe('open', function() {
        var $rootScope, mlListDialog, element;

        beforeEach(inject(function(_mlListDialog_, _$rootScope_, $mdDialog) {
            mlListDialog = _mlListDialog_;
            $rootScope = _$rootScope_;

            element = angular.element('<div>');
            var originalShow = $mdDialog.show;
            spyOn($mdDialog, 'show').and.callFake(function(options) {
                options.parent = element;
                originalShow(options);
            });
        }));

        it('should load template', function() {
            mlListDialog.open('foo');
            $rootScope.$apply();

            scope.fields = [];
            scope.items = [];
            scope.title_list = 'foo';
            $rootScope.$apply();

            expect(element.find('md-dialog').length).toEqual(1);
            expect(element.find('.md-toolbar-tools span:first').text()).toEqual('foo');
        });
    });
});