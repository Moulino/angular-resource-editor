describe('mlEditorController', function() {
    var controller,
        $mdDialog,
        mlResource,
        $scope;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$mdDialog_, _$controller_, _mlResource_) {
        $mdDialog = _$mdDialog_;
        $controller = _$controller_;
        mlResource = _mlResource_;
        $scope = {};

        spyOn(mlResource, 'getOptions').and.returnValue({
            fields: []
        });

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

    describe('getOptions', function() {
        it('should return an empty array if it is not defined', function() {
            var fieldStub = {};
            var options = $scope.getOptions(fieldStub);
            expect(options).toBeEmptyArray();
        });

        it('should return the options if they are defined', function() {
            var fieldStub = {
                select_options: [{id: 1}, {id: 2}]
            };
            var options = $scope.getOptions(fieldStub);
            expect(options).toEqual(fieldStub.select_options);
        })
    });

    describe('loadOptions', function() {
        var $q, $rootScope, getListDeferred, resource, fieldStub, categories;

        beforeEach(inject(function(_$q_, _$rootScope_) {
            $q = _$q_;
            $rootScope = _$rootScope_;
            $scope.item = {};

            getListDeferred = $q.defer();
            resource = {
                getList: function(params) {
                    return getListDeferred.promise;
                }
            };

            fieldStub = {
                model: 'category',
                select_resource: {
                    resource: 'categories',
                    label: 'name'
                }
            };

            categories = [
                {
                    '@id': '/api/categories/1',
                    name: 'category_1'
                },
                {
                    '@id': '/api/categories/2',
                    name: 'category_2'
                }
            ];

            spyOn(mlResource, 'get').and.returnValue(resource);
            spyOn(resource, 'getList').and.callThrough();
        }));

        it('should load options', function() {

            $scope.loadOptions(fieldStub);
            expect(mlResource.get).toHaveBeenCalledWith('categories');
            expect(resource.getList).toHaveBeenCalledWith({});
            expect(fieldStub.loading).toBeTrue();

            getListDeferred.resolve(categories);

            $rootScope.$apply();

            expect(fieldStub.select_options).toEqual([
                {
                    label: 'category_1',
                    value: '/api/categories/1'
                },
                {
                    label: 'category_2',
                    value: '/api/categories/2'
                }
            ]);
            expect(fieldStub.loading).toBeFalse();
        });

        it('should update item selected', function() {
            $scope.item = {
                category: categories[1]
            };
            $scope.loadOptions(fieldStub);

            getListDeferred.resolve(categories);
            $rootScope.$apply();

            expect($scope.item.category).toEqual(categories[1]['@id']);
        });

        it('should update loading flag when request succeeded', function() {
            $scope.loadOptions(fieldStub);
            expect(fieldStub.loading).toBeTrue();

            getListDeferred.resolve(categories);
            $rootScope.$apply();

            expect(fieldStub.loading).toBeFalse();
        });

        if('should update loading flag when request failed', function() {
            $scope.loadOptions(fieldStub);
            expect(fieldStub.loading).toBeTrue();

            getListDeferred.reject();
            $rootScope.$apply();

            expect(fieldStub.loading).toBeFalse();            
        });

        it('should display error message when xhr request failed', inject(function($window) {
            spyOn($window, 'alert');

            $scope.loadOptions(fieldStub);
            expect(fieldStub.loading).toBeTrue();

            getListDeferred.reject({
                'hydra:description': "test error"
            });

            $rootScope.$apply();
            expect($window.alert).toHaveBeenCalledWith("test error");  
        }));
    });
});