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
        $rootElement,
        mlEditorDialog,
        mlResources;

    beforeEach(module('mlResourceEditor'));

    beforeEach(inject(function(_$mdDialog_, _$rootElement_, _mlEditorDialog_, _mlResources_) {
        $mdDialog = _$mdDialog_;
        $rootElement = _$rootElement_;
        mlEditorDialog = _mlEditorDialog_;
        mlResources = _mlResources_;

        spyOn(mlResources, 'getOptions').and.returnValue({
            title_add: 'test_title',
            fields: []
        });
        spyOn(mlResources, 'createResource');
    }));

    it('open should display dialog', function() {
        spyOn($mdDialog, 'show');

        mlEditorDialog.open('tasks');
        expect($mdDialog.show).toHaveBeenCalled();
    });

    it('open should display a dialog with a title', function() {
        mlEditorDialog.open('tasks');

        var parent = $rootElement;
        console.log(parent);

        var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
        console.log(mdContainer);
        //expect($('body')).toHaveClass('.md-dialog-is-showing');
    })
});