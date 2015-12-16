describe('mlListController', function() {
    var $q, $rootScope, $controller, $window, mlCollections;

    beforeEach(module('mlResourcesEditor'));

    beforeEach(inject(function(_$q_, _$controller_, _$rootScope_, _$window_, _mlCollections_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $window = _$window_;
        mlCollections = _mlCollections_;
    }));

    describe('load', function() {
        var deferred;

        beforeEach(inject(function() {
            deferred = $q.defer();
            spyOn(mlCollections, 'load').and.returnValue(deferred.promise);
        }));

        it('should load collection', function() {
            $scope = {name: 'tasks'};
            $controller('mlListController', {$scope: $scope, test: true});

            expect(mlCollections.load).toHaveBeenCalledWith('tasks', 1);

            $scope.load(2);
            expect(mlCollections.load).toHaveBeenCalledWith('tasks', 2);
        });

        it('should update loading', function() {
            $scope = {name: 'tasks', test: true};
            $controller('mlListController', {$scope: $scope});

            $scope.load();
            expect($scope.loading).toBe(true);

            deferred.resolve([]);
            $rootScope.$apply();
            expect($scope.loading).toBe(false);
        });
    });

    describe('reload', function() {
        var $scope;

        beforeEach(function() {
            $scope = {
                name: 'tasks', 
                load: function() {},
                test: true
            };

            var controller = $controller('mlListController', {
                $scope: $scope,
                mlCollections: mlCollections
            });
        });

        it('should reload collection', function() {
            spyOn(mlCollections, 'reload').and.returnValue($q.defer().promise);
            $scope.reload();
            expect(mlCollections.reload).toHaveBeenCalledWith('tasks');
        });

        it('should update loading', function() {
            var deferred = $q.defer();
            spyOn(mlCollections, 'reload').and.returnValue(deferred.promise);
            $scope.reload();
            expect($scope.loading).toEqual(true);

            deferred.resolve([]);
            $rootScope.$apply();
            expect($scope.loading).toEqual(false);
        });
    });

    describe('itemSelected', function() {
        var $scope;

        beforeEach(function() {
            $scope = {
                name: 'tasks', 
                load: function() {},
                test: true
            };

            var controller = $controller('mlListController', {
                $scope: $scope
            });
        });

        it('should return null value if no row selected', function() {
            $scope.rowSelected = null;

            var item = $scope.itemSelected();
            expect(item).toBeNull();
        });

        it('should return item', function() {
            $scope.items = [{id: 1}, {id: 2}];
            $scope.rowSelected = 1;

            var item = $scope.itemSelected();
            expect(item).toEqual({id: 2});
        });
    });

    describe('add', function() {
        var mlEditorDialog, mlListDialog, $scope;

        beforeEach(inject(function(_mlEditorDialog_, _mlListDialog_) {
            mlEditorDialog = _mlEditorDialog_;
            mlListDialog = _mlListDialog_;

            $scope = {
                name: 'tasks', 
                load: function() {},
                test: true
            };

            var controller = $controller('mlListController', {
                $scope: $scope,
                mlCollections: mlCollections
            });
        }));

        it('should open the editor dialog', function() {
            spyOn(mlEditorDialog, 'open').and.returnValue($q.defer().promise);
            $scope.add();
            expect(mlEditorDialog.open).toHaveBeenCalledWith('tasks');
        });

        it('shoud save the item if editor dialog succeeded', function() {
            var deferred = $q.defer();
            var collection = {post: function() {}};

            spyOn(mlEditorDialog, 'open').and.returnValue(deferred.promise);
            spyOn(mlCollections, 'getCollection').and.returnValue(collection);
            spyOn(collection, 'post').and.returnValue({then: function() {}, finally: function(){}});

            $scope.add();
            deferred.resolve({id: 1});
            $rootScope.$apply();

            expect(mlCollections.getCollection).toHaveBeenCalledWith('tasks');
            expect(collection.post).toHaveBeenCalledWith({id: 1});
        });

        it('shoud reload collection if item save is succeeded', function() {
            var deferredDialog = $q.defer();
            var deferredPost = $q.defer();
            var collection = {post: function() {}};

            spyOn(mlEditorDialog, 'open').and.returnValue(deferredDialog.promise);
            spyOn(mlCollections, 'getCollection').and.returnValue(collection);
            spyOn(collection, 'post').and.returnValue(deferredPost.promise);
            spyOn($scope, 'reload');

            $scope.add();

            deferredDialog.resolve();
            deferredPost.resolve();
            $rootScope.$apply();

            expect($scope.reload).toHaveBeenCalled();
        });

        it('shoud open list dialog if mode is dialog', function() {
            var deferredDialog = $q.defer();
            var deferredPost = $q.defer();
            var collection = {post: function() {}};

            $scope.mode = 'dialog';

            spyOn(mlEditorDialog, 'open').and.returnValue(deferredDialog.promise);
            spyOn(mlCollections, 'getCollection').and.returnValue(collection);
            spyOn(collection, 'post').and.returnValue(deferredPost.promise);
            spyOn(mlListDialog, 'open');
            spyOn($scope, 'reload');

            $scope.add();

            deferredDialog.resolve();
            deferredPost.resolve();
            $rootScope.$apply();
            mlListDialog.open('tasks');

            expect(mlListDialog.open).toHaveBeenCalledWith('tasks');
        });

        it('shoud not open list dialog if mode is inline', function() {
            var deferredDialog = $q.defer();
            var deferredPost = $q.defer();
            var collection = {post: function() {}};

            $scope.mode = 'inline';

            spyOn(mlEditorDialog, 'open').and.returnValue(deferredDialog.promise);
            spyOn(mlCollections, 'getCollection').and.returnValue(collection);
            spyOn(collection, 'post').and.returnValue(deferredPost.promise);
            spyOn(mlListDialog, 'open');
            spyOn($scope, 'reload');

            $scope.add();
            deferredDialog.resolve();
            deferredPost.resolve();
            $rootScope.$apply();

            expect(mlListDialog.open.calls.any()).toBe(false);
        });

        it('should display error and re-open the editor box if post failed', function() {
            var deferredDialog = $q.defer();
            var deferredPost = $q.defer();
            var collection = {post: function() {}};

            $scope.mode = 'inline';

            spyOn(mlEditorDialog, 'open').and.returnValue(deferredDialog.promise);
            spyOn(mlCollections, 'getCollection').and.returnValue(collection);
            spyOn(collection, 'post').and.returnValue(deferredPost.promise);
            spyOn($window, 'alert');

            $scope.add();
            spyOn($scope, 'add');
            deferredDialog.resolve({id: 1});
            deferredPost.reject({'hydra:description': 'test error'});
            $rootScope.$apply();

            expect($window.alert).toHaveBeenCalledWith('test error');
            expect($scope.add).toHaveBeenCalled();
        });
    });

    describe('edit', function() {
        var mlEditorDialog, mlListDialog, $scope;

        beforeEach(inject(function(_mlEditorDialog_, _mlListDialog_) {
            mlEditorDialog = _mlEditorDialog_;
            mlListDialog = _mlListDialog_;

            $scope = {name: 'tasks', test: true};

            var controller = $controller('mlListController', {
                $scope: $scope
            });
        }));

        it('should open the editor dialog if an item is selected', function() {
            $scope.itemSelected = function() {};

            spyOn(mlEditorDialog, 'open').and.returnValue($q.defer().promise);
            spyOn($scope, 'itemSelected').and.returnValue({id: 1});

            $scope.edit();
            expect(mlEditorDialog.open).toHaveBeenCalledWith('tasks', {id: 1});
        });

        it('should do nothing if no item is selected', function() {
            $scope.itemSelected = function() {};

            spyOn(mlEditorDialog, 'open');
            spyOn($scope, 'itemSelected').and.returnValue(null);

            $scope.edit();
            expect(mlEditorDialog.open.calls.any()).toBe(false);
        });

        it('shoud save the item if editor dialog succeeded', function() {
            var deferred = $q.defer();
            var item = {
                id: 1,
                save: function() {
                    return $q.defer().promise;
                }
            };

            spyOn($scope, 'itemSelected').and.returnValue(item);
            spyOn(mlEditorDialog, 'open').and.returnValue(deferred.promise);
            spyOn(item, 'save').and.callThrough();
            
            $scope.edit();
            deferred.resolve(item);
            $rootScope.$apply();

            expect(mlEditorDialog.open).toHaveBeenCalledWith('tasks', item);
            expect(item.save).toHaveBeenCalled();
        });

        it('shoud reload collection if item save is succeeded', function() {
            var deferredDialog = $q.defer();
            var deferredSave = $q.defer();

            var item = {
                id: 1,
                save: function() {}
            };

            spyOn($scope, 'itemSelected').and.returnValue(item);
            spyOn(mlEditorDialog, 'open').and.returnValue(deferredDialog.promise);
            spyOn(item, 'save').and.returnValue(deferredSave.promise);
            spyOn($scope, 'reload');
            
            $scope.edit();
            deferredDialog.resolve(item);
            deferredSave.resolve();
            $rootScope.$apply();

            expect($scope.reload).toHaveBeenCalled();
        });

        it('should display error and re-open the editor box if post failed', function() {
            var deferredDialog = $q.defer();
            var deferredSave = $q.defer();

            var item = {
                id: 1,
                save: function() {}
            };

            spyOn($scope, 'itemSelected').and.returnValue(item);
            spyOn(mlEditorDialog, 'open').and.returnValue(deferredDialog.promise);
            spyOn(item, 'save').and.returnValue(deferredSave.promise);
            spyOn($window, 'alert');
            
            $scope.edit();
            spyOn($scope, 'edit');

            deferredDialog.resolve(item);
            deferredSave.reject({'hydra:description': 'test error'});
            $rootScope.$apply();

            expect($window.alert).toHaveBeenCalledWith('test error');
            expect($scope.edit).toHaveBeenCalled();
        });
    });

    describe('remove', function() {
        var $scope;

        beforeEach(inject(function() {
            $scope = {
                name: 'tasks', 
                load: function() {},
                test: true
            };

            var controller = $controller('mlListController', {
                $scope: $scope
            });
        }));

        it('should request confirmation before deleting the item', function() {
            $scope.question_remove = 'remove ?';

            spyOn($scope, 'itemSelected').and.returnValue(null);
            spyOn($window, 'confirm');

            $scope.remove();
            expect($window.confirm).toHaveBeenCalledWith('remove ?');
        });

        it('should remove the item and reload collection if it is not null', function() {
            $scope.question_remove = '';

            var item = {
                id: 1,
                remove: function() {}
            };

            var deferred = $q.defer();

            spyOn($scope, 'itemSelected').and.returnValue(item);
            spyOn($window, 'confirm').and.returnValue(true);
            spyOn(item, 'remove').and.returnValue(deferred.promise);
            spyOn($scope, 'reload');

            $scope.remove();
            deferred.resolve();
            $rootScope.$apply();

            expect(item.remove).toHaveBeenCalled();
            expect($scope.reload).toHaveBeenCalled();
        });

        it('should display error if remove failed', function() {
            $scope.question_remove = '';

            var item = {
                id: 1,
                remove: function() {}
            };

            var deferred = $q.defer();

            spyOn($scope, 'itemSelected').and.returnValue(item);
            spyOn($window, 'confirm').and.returnValue(true);
            spyOn($window, 'alert');
            spyOn(item, 'remove').and.returnValue(deferred.promise);

            $scope.remove();
            deferred.reject({'hydra:description': 'test error'});
            $rootScope.$apply();

            expect($window.alert).toHaveBeenCalledWith('test error');
        });
    });

    describe('getString', function() {
        var $scope, $filter;

        beforeEach(inject(function(_$filter_) {
            $filter = _$filter_;
            $scope = {
                name: 'tasks', 
                load: function() {},
                test: true
            };

            var controller = $controller('mlListController', {
                $scope: $scope
            });
        }));

        it('should apply user function if it is defined', function() {
            var field = {
                to_string: function() {}
            };
            var item = {id: 1};

            spyOn(field, 'to_string');

            $scope.getString(field, item);
            expect(field.to_string).toHaveBeenCalledWith(item);
        });

        it('should apply date filter for datetime', function() {
            var field = {
                type: 'date',
                date_format: 'dd-MM-yyyy"'
            };

            $filter = jasmine.createSpy().and.callFake(function() {return function() {}});

            $controller('mlListController', {$scope: $scope, $filter: $filter});

            $scope.getString(field, {});
            expect($filter).toHaveBeenCalledWith('date');
        });

        it('should return item value', function() {
            var field = {
                type: 'text',
                model: 'foo'
            };

            var item = {foo: 'bar'};

            var text = $scope.getString(field, item);
            expect(text).toEqual('bar');
        });
    });
});