describe('mlEditorDialog factory', function() {
    var $mdDialog,
        $rootScope,
        mlEditorDialog,
        mlResource,
        element,
        scope;


    beforeEach(module('mlResourceEditor', function($controllerProvider) {
        $controllerProvider.register('mlEditorController', function($scope) {
            $scope.fields = [
                {
                    label: 'foo',
                    type: 'number',
                    model: 'foo'
                }
            ];

            $scope.cancel = jasmine.createSpy('cancel');
            $scope.ok = jasmine.createSpy('ok');

            scope = $scope;
        });
    }));

    beforeEach(inject(function(_$mdDialog_, _$rootScope_, _mlEditorDialog_, _mlResource_) {
        $mdDialog = _$mdDialog_;
        $rootScope = _$rootScope_;
        mlEditorDialog = _mlEditorDialog_;
        mlResource = _mlResource_;

        element = angular.element('<div>');
        var originalShow = $mdDialog.show;
        spyOn($mdDialog, 'show').and.callFake(function(options) {
            options['parent'] = element;
            originalShow(options);
        });

        mlResource.createResource = function() {return {bar: 0}};
        mlResource.getOptions = function() {
            return {
                title_add: 'test add',
                title_edit: 'test edit'
            };
        };
    }));

    it('should display select field', function() {
        mlEditorDialog.open('foo');
        $rootScope.$apply();

        var newField = {
            label: 'bar',
            type: 'select',
            model: 'bar'
        };

        scope.fields.push(newField);

        // mock load options function
        scope.loadOptions = jasmine.createSpy('loadOptions');
        scope.getOptions = jasmine.createSpy('getOptions').and.returnValue([
            {label: 'foo1', value: 'bar1'},
            {label: 'foo2', value: 'bar2'}
        ]);

        $rootScope.$digest();

        var $select = element.find('md-select');

        expect(element.find('md-select').length).toEqual(1);
        expect(scope.loadOptions).toHaveBeenCalledWith(newField);
        expect(scope.getOptions).toHaveBeenCalledWith(newField);

    });

    it('should display dialog for adding', function() {
        mlEditorDialog.open('foo');
        $rootScope.$apply();
        
        expect(element.find('md-dialog').length).toEqual(1);
        expect(element.find('input[name=\'foo\']').length).toEqual(1);
        expect(element.find('.md-toolbar-tools span:first-child').text()).toEqual('test add');
    });

    it('should display dialog for editing', function() {
        mlEditorDialog.open('foo', {bar: 6});
        $rootScope.$apply();
        
        expect(element.find('.md-toolbar-tools span:first-child').text()).toEqual('test edit');
    });

    it('close button should close the dialog', function() {
        mlEditorDialog.open('foo');
        $rootScope.$apply();
        element.find('.md-toolbar-tools button').triggerHandler('click');

        expect(scope.cancel).toHaveBeenCalled();
    });

    it('ok button should call the method', function() {
        mlEditorDialog.open('foo');
        $rootScope.$apply();
        element.find('md-dialog-actions button:last').triggerHandler('click');

        expect(scope.ok).toHaveBeenCalled();
    });

    it('cancel button should call the method', function() {
        mlEditorDialog.open('foo');
        $rootScope.$apply();
        element.find('md-dialog-actions button:first').triggerHandler('click');

        expect(scope.cancel).toHaveBeenCalled();
    });
});