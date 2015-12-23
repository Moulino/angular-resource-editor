describe('mlListController', function() {
    var $q,
        $rootScope, 
        controller, 
        $window, 
        $scope,
        mlCollection;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$q_, _$controller_, _$rootScope_, _$window_, _mlCollection_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        $window = _$window_;
        mlCollection = _mlCollection_;

        $scope = {test: true};
        controller = _$controller_('mlListController', {$scope: $scope});
    }));

    it('should init variables', function() {
        expect($scope.items).toBeEmptyArray();
        expect($scope.rowSelected).toBeNull();
        expect($scope.mode).toEqual('inline');
    });

    describe('load', function() {
        var deferred;

        beforeEach(function() {
            deferred = $q.defer();

            spyOn(mlCollection, 'load').and.returnValue(deferred.promise);
            $scope.name = 'tasks';
        });

        it('should load the first page by default', function() {
            $scope.load();
            expect(mlCollection.load).toHaveBeenCalledWith('tasks', 1);
        });

        it('should load collection', function() {
            $scope.load(2); // load second page
            deferred.resolve();
            $rootScope.$apply();
            expect(mlCollection.load).toHaveBeenCalledWith('tasks', 2);
        });

        it('should update loading flag', function() {
            $scope.load();
            expect($scope.loading).toBeTrue();
            deferred.resolve();
            $rootScope.$apply();
            expect($scope.loading).toBeFalse();
        });
    });

    describe('reload', function() {
        var deferred;

        beforeEach(function() {
            deferred = $q.defer();

            spyOn(mlCollection, 'reload').and.returnValue(deferred.promise);
            $scope.name = 'tasks';
        });

        it('should reload the collection', function() {
            $scope.reload();
            deferred.resolve();
            $rootScope.$apply();
            expect(mlCollection.reload).toHaveBeenCalledWith('tasks');
        });

        it('should update loading flag', function() {
            $scope.reload();
            expect($scope.loading).toBeTrue();
            deferred.resolve();
            $rootScope.$apply();
            expect($scope.loading).toBeFalse();
        });
    });

    describe('itemSelected', function() {
        it('should return an item', function() {
            $scope.items = [{id: 1}, {id: 2}];
            $scope.rowSelected = 1;

            expect($scope.itemSelected()).toEqual({id: 2});
        });

        it('should return null if any row is selected', function() {
            $scope.rowSelected = null;
            expect($scope.itemSelected()).toBeNull();
        });
    });

    describe('add', function() {
        var mlEditorDialog, 
            dialogDeferred,
            postDeferred,
            collection;

        beforeEach(inject(function(_mlEditorDialog_) {
            mlEditorDialog = _mlEditorDialog_;

            dialogDeferred = $q.defer();
            postDeferred = $q.defer();

            collection = {
                post: function() { return postDeferred.promise; }
            };

            $scope.name = 'tasks';

            spyOn(mlEditorDialog, 'open').and.returnValue(dialogDeferred.promise);
            spyOn(mlCollection, 'getResource').and.returnValue(collection);
            spyOn(collection, 'post').and.callThrough();
            spyOn($scope, 'reload');
        }));

        it('should post the new item if the dialog succeeded', function() {
            var item = {id: 1, name: 'task1'};
            $scope.add();

            dialogDeferred.resolve(item);
            $rootScope.$apply();

            expect(mlCollection.getResource).toHaveBeenCalledWith('tasks');
            expect(collection.post).toHaveBeenCalledWith(item);
        });

        it('should do nothing if the dialog failed', function() {
            $scope.add();

            dialogDeferred.reject();
            $rootScope.$apply();

            expect(mlCollection.getResource).not.toHaveBeenCalled();
        });

        it('should reload collection if the the item is added', function() {
            $scope.add();

            dialogDeferred.resolve({});
            postDeferred.resolve();
            $rootScope.$apply();

            expect($scope.reload).toHaveBeenCalled();
        });

        it('should open list dialog after adding if dialog', inject(function(mlListDialog) {
            spyOn(mlListDialog, 'open');
            $scope.mode = 'dialog';

            $scope.add();

            dialogDeferred.resolve();
            postDeferred.resolve();
            $rootScope.$apply();

            expect(mlListDialog.open).toHaveBeenCalledWith('tasks');
        }));

        it('should not open the list dialog if inline', inject(function(mlListDialog) {
            spyOn(mlListDialog, 'open');

            $scope.add();

            dialogDeferred.resolve();
            postDeferred.resolve();
            $rootScope.$apply();

            expect(mlListDialog.open).not.toHaveBeenCalled();
        }));

        it('should display error and re-open add dialog if post failed', inject(function($window) {
            spyOn($window, 'alert');

            $scope.add();

            dialogDeferred.resolve();
            postDeferred.reject({
                'hydra:description': 'test error'
            });
            spyOn($scope, 'add');
            $rootScope.$apply();


            expect($window.alert).toHaveBeenCalledWith('test error');
            expect($scope.add).toHaveBeenCalled();
        }));
    });

    describe('edit', function() {
        var mlEditorDialog, 
            dialogDeferred,
            saveDeferred,
            itemUpd;

        beforeEach(inject(function(_mlEditorDialog_) {
            mlEditorDialog = _mlEditorDialog_;

            dialogDeferred = $q.defer();
            saveDeferred = $q.defer();

            itemUpd = {
                save: function() { return saveDeferred.promise; }
            };

            $scope.name = 'tasks';

            spyOn(mlEditorDialog, 'open').and.returnValue(dialogDeferred.promise);
            spyOn(itemUpd, 'save').and.callThrough();
            spyOn($scope, 'itemSelected').and.returnValue({id: 1});
            spyOn($scope, 'reload');
        }));

        it('should save the item if the dialog succeeded', function() {
            $scope.edit();

            dialogDeferred.resolve(itemUpd);
            $rootScope.$apply();

            expect(mlEditorDialog.open).toHaveBeenCalledWith('tasks', {id: 1});
            expect(itemUpd.save).toHaveBeenCalled();
        });

        it('should do nothing if the dialog failed', function() {
            $scope.edit();

            dialogDeferred.reject();
            $rootScope.$apply();

            expect(itemUpd.save).not.toHaveBeenCalled();
        });

        it('should reload collection if the the item is saved', function() {
            $scope.edit();

            dialogDeferred.resolve(itemUpd);
            saveDeferred.resolve();
            $rootScope.$apply();

            expect($scope.reload).toHaveBeenCalled();
        });

        it('should open list dialog after adding if dialog', inject(function(mlListDialog) {
            spyOn(mlListDialog, 'open');
            $scope.mode = 'dialog';

            $scope.edit();

            dialogDeferred.resolve(itemUpd);
            saveDeferred.resolve();
            $rootScope.$apply();

            expect(mlListDialog.open).toHaveBeenCalledWith('tasks');
        }));

        it('should not open the list dialog if inline', inject(function(mlListDialog) {
            spyOn(mlListDialog, 'open');

            $scope.edit();

            dialogDeferred.resolve(itemUpd);
            saveDeferred.resolve();
            $rootScope.$apply();

            expect(mlListDialog.open).not.toHaveBeenCalled();
        }));

        it('should display error and re-open add dialog if post failed', inject(function($window) {
            spyOn($window, 'alert');

            $scope.edit();

            dialogDeferred.resolve(itemUpd);
            saveDeferred.reject({
                'hydra:description': 'test error'
            });
            spyOn($scope, 'edit');
            $rootScope.$apply();


            expect($window.alert).toHaveBeenCalledWith('test error');
            expect($scope.edit).toHaveBeenCalled();
        }));
    });

    describe('remove', function() {
        var $window,
            removeDeferred, 
            item;

        beforeEach(inject(function(_$window_) {
            $window = _$window_;

            removeDeferred = $q.defer();

            item = {
                remove: function() { return removeDeferred.promise; }
            };

            $scope.question_remove = 'test question';
            spyOn($window, 'confirm').and.returnValue(true);
            spyOn($scope, 'itemSelected').and.returnValue(item);
            spyOn(item, 'remove').and.callThrough();
        }));

        it('should ask confirmation', function() {
            $scope.remove();
            expect($window.confirm).toHaveBeenCalledWith('test question');
        });

        it('should remove the item', function() {
            $scope.remove();
            expect(item.remove).toHaveBeenCalled();
        });

        it('should reload the collection if the removal succeeded', function() {
            spyOn($scope, 'reload');
            $scope.remove();
            removeDeferred.resolve();
            $rootScope.$apply();
            expect($scope.reload).toHaveBeenCalled();
        });

        it('should display alert if the removal failed', function() {
            spyOn($window, 'alert');
            $scope.remove();
            removeDeferred.reject({
                'hydra:description': 'test error'
            });
            $rootScope.$apply();
            expect($window.alert).toHaveBeenCalledWith('test error');
        });
    });

    describe('getString', function() {

        it('should call the field converter if it exists', function() {
            var field = {
                model: 'test',
                to_string: jasmine.createSpy('to_string')
            };

            var item = {test: 'test'};

            $scope.getString(field, item);

            expect(field.to_string).toHaveBeenCalledWith('test');
        });

        it('should convert date', function() {
            var field = {
                model: 'test',
                type: 'date',
                date_format: 'dd-MM-yyyy'
            };
            var item = {
                test: new Date(2015, 01, 05)
            };

            var result = $scope.getString(field, item);
            expect(result).toEqual('05-02-2015');            
        });

        it('else should return the item field', function() {
            var field = {
                model: 'test',
                to_string: 'test_to_string'
            };

            var item = {
                test: 'test'
            };

            var result = $scope.getString(field, item);
            expect(result).toEqual('test');
        });
    });
});