describe('mlEditorController', function() {
    var controller,
        $mdDialog,
        mlResources,
        $scope;

    beforeEach(module('mlResourcesEditor'));

    beforeEach(inject(function(_$mdDialog_, _$controller_, _mlResources_) {
        $mdDialog = _$mdDialog_;
        $controller = _$controller_;
        mlResources = _mlResources_;
        $scope = {};

        controller = $controller('mlEditorController', {
            $scope: $scope
        });
    }));

    it('ok should return the item', function() {
        $scope.item = {id: 1};
        spyOn($mdDialog, 'hide');
        $scope.ok();
        expect($mdDialog.hide).toHaveBeenCalledWith({id: 1});
    });

    it('cancel should return the item', function() {
        spyOn($mdDialog, 'cancel');
        $scope.cancel();
        expect($mdDialog.cancel).toHaveBeenCalled();
    });

    it('getOptions should return an empty array', function() {
        var options = $scope.getOptions({});
        expect(options).toBeEmptyArray();
    });

    describe('refreshOptions', function() {
        var $q, $rootScope, $window, field, resource, deferred;

        beforeEach(inject(function(_$q_, _$rootScope_, _$window_) {
            $q = _$q_;
            $rootScope = _$rootScope_;
            $window = _$window_;

            field = {
                select_resource: {
                    resource: 'api/categories',
                    label: 'name'
                }
            };

            resource = {
                getList: function() {}
            };

            deferred = $q.defer();

            spyOn(mlResources, 'get').and.returnValue(resource);
            spyOn(resource, 'getList').and.returnValue(deferred.promise);
        }));

        it('should load the options', function() {
            
            $scope.refreshOptions(field);
            deferred.resolve([
                {
                    '@id': 'api/category/1',
                    name: 'category_1'
                },
                {
                    '@id': 'api/category/2',
                    name: 'category_2'
                }
            ]);

            $rootScope.$apply();

            expect(field.select_options).toEqual([
                {label: 'category_1', value: 'api/category/1'},
                {label: 'category_2', value: 'api/category/2'}
            ]);
        });

        it('should alert the user when the request failed', function() {
            $scope.refreshOptions(field);
            deferred.reject({
                'hydra:description': 'test erreur'
            });

            spyOn($window, 'alert');

            $rootScope.$apply();
            expect($window.alert).toHaveBeenCalledWith('test erreur');
        });

        it('should update loading correctly when the request succeeded', function() {
            $scope.refreshOptions(field);
            expect(field.loading).toEqual(true);
            
            deferred.resolve([]);
            $rootScope.$apply();
            expect(field.loading).toEqual(false);
        });

        it('should update loading correctly when the request failed', function() {
            $scope.refreshOptions(field);
            expect(field.loading).toEqual(true);

            spyOn($window, 'alert');
            
            deferred.reject({
                'hydra:description': 'test erreur'
            });
            $rootScope.$apply();
            expect(field.loading).toEqual(false);
        });
    });
});