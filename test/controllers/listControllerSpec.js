describe('mlListController', function() {
    var $controller;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    it('should write error on console if the mode is not defined', function() {
        spyOn(console, 'error');
        $controller('mlListController', {$scope: {}});

        expect(console.error).toHaveBeenCalledWith("The mode value must be defined.")
    });

    it('should extend the current scope with the default options', function() {
        var $scope = {mode: 'inline'};
        $controller('mlListController', {$scope: $scope});

        expect($scope.title_list).toEqual('Resource manager');
    });

    it('itemSelected should return an item', function() {
        var fixtures = [{id: 1, name: 'name1'}, {id: 2, name: 'name2'}];
        var $scope = {mode: 'inline'};

        $controller('mlListController', {$scope: $scope});
        $scope.items = fixtures;
        $scope.rowSelected = 1;

        var item = $scope.itemSelected();
        expect(item).toEqual({id: 2, name: 'name2'});
    });

    describe('add function', function() {

        var $rootScope,
            $scope,
            $mdDialog,
            mockItem,
            dialogBoxDiffered,
            updateDiffered,
            mlEditorDialog,
            mlListDialog,
            mlResources;


        beforeEach(inject(function($q, _$rootScope_, _$mdDialog_, _mlEditorDialog_, _mlListDialog_, _mlResources_) {
            mlEditorDialog = _mlEditorDialog_;
            mlListDialog = _mlListDialog_;
            mlResources = _mlResources_;
            $rootScope = _$rootScope_;
            $mdDialog = _$mdDialog_;

            $scope = {
                mode: 'dialog',
                name: 'tasks'
            };

            dialogBoxDiffered = $q.defer();
            updateDiffered = $q.defer();

            mockItem = {
                $save: function() {
                    return updateDiffered.promise;
                }
            };

            $controller('mlListController', {$scope: $scope});

            spyOn(mlEditorDialog, 'open').and.returnValue(dialogBoxDiffered.promise);
            spyOn(mlListDialog, 'open');
            spyOn(mockItem, '$save').and.callThrough();
            spyOn(mlResources, 'load');
        }));

        it('should display an adding box', function() {
            $scope.add();
            expect(mlEditorDialog.open).toHaveBeenCalledWith('tasks');
        });

        it('should save item', function() {
            $scope.add();
            dialogBoxDiffered.resolve(mockItem);
            $rootScope.$apply();

            expect(mockItem.$save).toHaveBeenCalled();
        });

        it('should re-open the list box', function() {
            $scope.add();
            dialogBoxDiffered.resolve(mockItem);
            $rootScope.$apply();

            expect(mlListDialog.open).toHaveBeenCalledWith('tasks');
        });

        it('should display the error in console', function() {
            spyOn(console, 'error');

            $scope.add();
            dialogBoxDiffered.resolve(mockItem);
            updateDiffered.reject('error');
            $rootScope.$apply();

            expect(console.error).toHaveBeenCalledWith('error');
        });
    });

    describe('edit function', function() {

        var $rootScope,
            $scope,
            mockItem,
            dialogBoxDiffered,
            updateDiffered,
            mlEditorDialog,
            mlListDialog,
            mlResources;


        beforeEach(inject(function($q, _$rootScope_, _mlEditorDialog_, _mlListDialog_, _mlResources_) {
            mlEditorDialog = _mlEditorDialog_;
            mlListDialog = _mlListDialog_;
            mlResources = _mlResources_;
            $rootScope = _$rootScope_;

            $scope = {
                mode: 'dialog',
                name: 'tasks'
            };

            dialogBoxDiffered = $q.defer();
            updateDiffered = $q.defer();

            mockItem = {
                $update: function() {
                    return updateDiffered.promise;
                }
            };

            $controller('mlListController', {$scope: $scope});

            spyOn(mlEditorDialog, 'open').and.returnValue(dialogBoxDiffered.promise);
            spyOn(mlListDialog, 'open');
            spyOn($scope, 'itemSelected');
            spyOn($scope, 'normalizeResources').and.returnValue(mockItem);
            spyOn(mockItem, '$update').and.callThrough();
            spyOn(mlResources, 'load');
        }));

        it('should display an editing box', function() {
            $scope.edit();
            expect(mlEditorDialog.open).toHaveBeenCalledWith('tasks', mockItem);
        });

        it('should update item', function() {
            $scope.edit();
            dialogBoxDiffered.resolve(mockItem);
            $rootScope.$apply();

            expect(mockItem.$update).toHaveBeenCalled();
        });

        it('should re-open the list box', function() {
            $scope.edit();
            dialogBoxDiffered.resolve(mockItem);
            $rootScope.$apply();

            expect(mlListDialog.open).toHaveBeenCalledWith('tasks');
        });

        it('should display the error in console', function() {
            spyOn(console, 'error');

            $scope.edit();
            dialogBoxDiffered.resolve(mockItem);
            updateDiffered.reject('error');
            $rootScope.$apply();

            expect(console.error).toHaveBeenCalledWith('error');
        });
    });

    describe('remove function', function() {
        var $scope,
            mockItem,
            removeDeferred,
            $rootScope,
            $window,
            mlResources;

        beforeEach(inject(function($controller, $q, _$rootScope_, _$window_,  _mlResources_) {
            $rootScope = _$rootScope_;
            $window = _$window_;
            mlResources = _mlResources_;

            removeDeferred = $q.defer();

            $scope = {
                mode: 'inline',
                name: 'tasks'
            };

            mockItem = {
                $remove: function() {
                    return removeDeferred.promise;
                }
            };

            $controller('mlListController', {$scope: $scope});

            spyOn($scope, 'itemSelected').and.returnValue(mockItem);
            spyOn($window, 'confirm').and.returnValue(true);
            spyOn(mockItem, '$remove').and.callThrough();
            spyOn(mlResources, 'load');
        }));

        it('should request confirmation of deletion', function() {
            $scope.question_remove = 'remove it ?';
            $scope.remove();
            expect($window.confirm).toHaveBeenCalledWith("remove it ?");
        });

        it('should remove item selected', function() {
            $scope.remove();
            expect(mockItem.$remove).toHaveBeenCalled();
        });

        it('should reload items if success', function() {
            $scope.rowSelected = 2;
            $scope.remove();
            removeDeferred.resolve();
            $rootScope.$apply();

            expect(mlResources.load).toHaveBeenCalledWith('tasks');
            expect($scope.rowSelected).toBeNull();

        });

        it("should display the error if it's occured", function() {
            spyOn(console, 'error');

            $scope.remove();
            removeDeferred.reject('error !');
            $rootScope.$apply();

            expect(console.error).toHaveBeenCalledWith('error !');
        });
    });

    describe('getString function', function() {

        var $scope;

        beforeEach(inject(function($controller) {
            $scope = {
                mode: 'inline',
                name: 'tasks'
            };

            $controller('mlListController', {$scope: $scope});
        }));

        it("should call to_string function if it is defined in field object", function() {
            var mockField = {
                to_string: function(item) {}
            };

            var mockItem = {id: 1};

            spyOn(mockField, 'to_string').and.returnValue('ok !');

            var result = $scope.getString(mockField, mockItem);
            expect(mockField.to_string).toHaveBeenCalledWith(mockItem);
            expect(result).toEqual('ok !');
        });

        it("should convert date field", function() {
            var mockField = {
                model: 'date',
                type: 'date',
                date_format: 'dd-MM-yyyy'
            };

            var mockItem = {date: new Date(2010, 5, 10)};

            var datestr = $scope.getString(mockField, mockItem);
            expect(datestr).toEqual('10-06-2010');
        });

        it("should return the text value", function() {
            var mockField = {
                model: 'test',
                type: 'text'
            };

            var mockItem = {test: 'Hello world !'};

            var result = $scope.getString(mockField, mockItem);
            expect(result).toEqual('Hello world !');
        });
    });
});