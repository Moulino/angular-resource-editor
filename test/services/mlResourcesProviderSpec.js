describe('mlResources provider : ', function() {

    var provider;
    var mlResources;

    beforeEach(module('mlResourcesEditor', function(mlResourcesProvider) {
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