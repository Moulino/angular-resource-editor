describe('mlUtils factory : ', function() {
    var mlUtils;

    beforeEach(module('mlResourceEditor'));
    beforeEach(inject(function(_mlUtils_) {
        mlUtils = _mlUtils_;
    }));

    describe('rDateConvert', function() {
        it('should converts date string', function() {
            var fixture = {tdate: '10/06/2015'};

            mlUtils.rDateConvert(fixture);
            expect(fixture.tdate).toBeDate();
        });

        it('should not converts wrong date string', function() {
            var fixture = {tdate: 'test'};
            mlUtils.rDateConvert(fixture);

            expect(fixture.tdate).toBeString();
        });

        it('should converts date string deeply', function() {
            var fixture = {
                ttext: 'test',
                obj: {
                    tdate: '10-05-2014'
                }
            };
            mlUtils.rDateConvert(fixture);

            expect(fixture.obj.tdate).toBeDate();
        });

        it('should not converts an integer', function() {
            var fixture = {tdate: 1};
            mlUtils.rDateConvert(fixture);
            expect(fixture.tdate).toBeNumber();
        });
    });
});

describe('mlResourceTransform factory : ', function() {
    var mlResourceTransform;

    beforeEach(module('mlResourceEditor'));
    beforeEach(inject(function(_mlResourceTransform_) {
        mlResourceTransform = _mlResourceTransform_;
    }));

    describe('request', function() {
        it('should converts resource in id', function() {
            var fixture = {field1: 'test', field2: {id: 3, sfield1: 'test'}};
            var obj = angular.fromJson(mlResourceTransform.request(fixture));

            expect(obj.field2).toEqual(3);
        });

        it('should not converts resource if member "id" is not found', function() {
            var fixture = {field1: 'test', field2: {number: 3, sfield1: 'test'}};
            var obj = mlResourceTransform.request(fixture);

            expect(obj).toEqual(angular.toJson(fixture));
        });
    });

    describe('response', function() {
        var mlUtils;

        beforeEach(inject(function(_mlUtils_) {
            mlUtils = _mlUtils_;
            spyOn(mlUtils, 'rDateConvert');
        }));

        it('should call rDateConvert', function() {
            mlResourceTransform.response("[{}]");
            expect(mlUtils.rDateConvert).toHaveBeenCalled();
        });
    });
});

describe('inInputTypes filter', function() {
    var $filter;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$filter_) {
        $filter = _$filter_;
    }));

    it('Return true when given text', function() {
        var inInputTypes = $filter('inInputTypes');
        expect(inInputTypes('text')).toBe(true);
    });

    it('Return true when given number', function() {
        var inInputTypes = $filter('inInputTypes');
        expect(inInputTypes('number')).toBe(true);
    });

    it('Return false when given select', function() {
        var inInputTypes = $filter('inInputTypes');
        expect(inInputTypes('select')).toBe(false);
    });
});

describe('mlResources provider : ', function() {

    var provider;
    var mlResources;

    beforeEach(module('mlResourceEditor', function(mlResourcesProvider) {
        provider = mlResourcesProvider;
        provider.addResource({
            name: 'tasks',
            url: 'api/tasks/:id.json',
            url_params: {id: '@id'}
        });
    }));

    beforeEach(inject(function(_mlResources_) {
        mlResources = _mlResources_;
    }));

    describe('init', function() {

        beforeEach(function() {
            spyOn(mlResources, "load");
            mlResources.init();
        });

        it('should create the resource', function() {
            expect(provider.resources.tasks).toBeFunction();
        });

        it('should create the collection', function() {
            expect(provider.collections).toHaveMember('tasks');
            expect(provider.collections.tasks).toBeEmptyArray();
        });

        it('should call load', function() {
            expect(mlResources.load).toHaveBeenCalledWith('tasks');
        });
    });

    describe('load', function() {
        var $httpBackend;
        var collection = [{id: 1, name: 'test1'}, {id: 2, name: 'test2'}];

        beforeEach(inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', 'api/tasks.json').respond(collection);
        }));

        beforeEach(function() {
            mlResources.init();
        });

        it('should fetch collection', function() {
            $httpBackend.expectGET('api/tasks.json');
            mlResources.load('tasks');
            $httpBackend.flush();

            expect(provider.collections['tasks']).toBeNonEmptyArray();
        });

        it('should throw error when the name is not defined', function() {
            expect(function() {
                mlResources.load()
            }).toThrow();
        });
    });

    describe('getResource', function() {
        beforeEach(function() {
            mlResources.init();
        });

        it('should return resource function', function() {
            var resource = mlResources.getResource('tasks');
            expect(resource).toBeFunction();
        });
    });

    describe('getCollection', function() {
        beforeEach(function() {
            mlResources.init();
        });

        it('should return collection', function() {
            var collection = mlResources.getCollection('tasks');
            expect(collection).toBeArray();
            expect(collection).toEqual(collection);
        });
    });

    describe('getOptions', function() {
        it('should return an object', function() {
            expect(mlResources.getOptions('tasks')).toBeObject();
        });
    });

    describe('createResource', function() {
        beforeEach(function() {
            mlResources.init();
        });

        it('should return a new resource', function() {
            var resource = mlResources.createResource('tasks');
            expect(resource).toHaveMethod('$query');
        });

        it('should create a new member of type "date', function() {
            spyOn(mlResources, 'getOptions').and.returnValue({fields: [{model: 'date', type: 'date'}]});

            var resource = mlResources.createResource('tasks');
            expect(resource).toHaveMember('date');
            expect(resource.date).toBeDate();
        });

        it('should create a new member from type "select" and equal to null', function() {
            spyOn(mlResources, 'getOptions').and.returnValue({fields: [{model: 'category', type: 'select'}]});

            var resource = mlResources.createResource('tasks');
            expect(resource).toHaveMember('category');
            expect(resource.category).toBeNull();
        });

        it('should create a new integer equal to 0', function() {
            spyOn(mlResources, 'getOptions').and.returnValue({fields: [{model: 'test', type: 'number'}]});

            var resource = mlResources.createResource('tasks');
            expect(resource).toHaveMember('test');
            expect(resource.test).toEqual(0);
        });

        it('should create a new member with an empty string', function() {
            spyOn(mlResources, 'getOptions').and.returnValue({fields: [{model: 'test', type: 'text'}]});

            var resource = mlResources.createResource('tasks');
            expect(resource).toHaveMember('test');
            expect(resource.test).toBeEmptyString();
        });
    });
});

describe('mlList directive', function() {
    var $compile,
        $rootScope,
        mlResources;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _mlResources_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        mlResources = _mlResources_;
    }));

    it('should include list template', function() {
        var node = $compile("<div ml-list name='tasks'></div>")($rootScope);
        $rootScope.$digest();

        expect(node).toContainElement('.ml-list');

        var scope = node.isolateScope();
        expect(scope).toHaveMember('name');
        expect(scope.name).toEqual('tasks');
    });

    it('should display items', function() {
        spyOn(mlResources, 'getOptions').and.returnValue({
            fields: [
                {label: 'Id', model: 'id', type: 'number'},
                {label: 'Name', model: 'name',type: 'text'}
            ]
        });
        spyOn(mlResources, 'getCollection').and.returnValue([
            {id: 1, name: 'task1'},
            {id: 2, name: 'task2'}
        ]);

        var node = $compile("<div ml-list name='tasks'></div>")($rootScope);
        $rootScope.$digest();

        expect(node.find('tbody>tr')).toHaveLength(2);
        expect(node.find('tbody>tr:first-child>td:first-child')).toHaveText(1);
        expect(node.find('tbody>tr:last-child>td:last-child')).toHaveText('task2');
    });

    it('should display title', function() {
        spyOn(mlResources, 'getOptions').and.returnValue({
            title_list: 'Test_title'
        });
        spyOn(mlResources, 'getCollection').and.returnValue([]);

        var node = $compile("<div ml-list name='tasks'></div>")($rootScope);
        $rootScope.$digest();

        expect(node.find('.ml-list-title')).toHaveText('Test_title');
    });
});

describe('mlListSelection directive', function() {
    var $compile,
        $rootScope,
        element;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        var template =
            '<div ml-list-selection >'+
                '<table><tbody>'+
                    '<tr><td>1</td></tr>'+
                    '<tr><td>2</td></tr>'+
                '</tbody></table>'+
            '</div>';

        $rootScope.rowSelected = null;
        element = $compile(template)($rootScope);
    }));

    it('should select a row when it clicked', function() {
        element.find('tr:last-child').trigger('click');
        expect($rootScope.rowSelected).toEqual(1);
    });

    it('should unselect a row when it receives a second click event', function() {
        element.find('tr:last-child').trigger('click');
        expect($rootScope.rowSelected).toEqual(1);
        element.find('tr:last-child').trigger('click');
        expect($rootScope.rowSelected).toEqual(null);
    });
});

describe('mlEditorDialog factory', function() {
    var $mdDialog,
        $rootScope,
        mlEditorDialog,
        mlResources,
        testElement;


    beforeEach(module('mlResourceEditor'));

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
});