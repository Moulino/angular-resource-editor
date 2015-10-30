describe('mlUtils factory : ', function() {
    var service;

    beforeEach(module('mlResourceEditor'));
    beforeEach(inject(function(mlUtils) {
        service = mlUtils;
    }));

    describe('rDateConvert', function() {
        it('should converts date string', function() {
            var fixture = {tdate: '10/06/2015'};

            service.rDateConvert(fixture);
            expect(fixture.tdate).toBeDate();
        });

        it('should not converts wrong date string', function() {
            var fixture = {tdate: 'test'};
            service.rDateConvert(fixture);

            expect(fixture.tdate).toBeString();
        });

        it('should converts date string deeply', function() {
            var fixture = {
                ttext: 'test',
                obj: {
                    tdate: '10-05-2014'
                }
            };
            service.rDateConvert(fixture);

            expect(fixture.obj.tdate).toBeDate();
        });

        it('should not converts integer', function() {
            var fixture = {tdate: 1};
            service.rDateConvert(fixture);
            expect(fixture.tdate).toBeNumber();
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
    var mlResourcesService;

    beforeEach(module('mlResourceEditor', function(mlResourcesProvider) {
        provider = mlResourcesProvider;
        provider.addResource({
            name: 'tasks',
            url: 'api/tasks/:id.json',
            url_params: {id: '@id'}
        });
    }));

    beforeEach(inject(function(mlResources) {
        mlResourcesService = mlResources;
    }));

    describe('init', function() {

        beforeEach(function() {
            spyOn(mlResourcesService, "load");
            mlResourcesService.init();
        });

        it('should create the resource', function() {
            expect(provider.resources.tasks).toBeFunction();
        });

        it('should create the collection', function() {
            expect(provider.collections).toHaveMember('tasks');
            expect(provider.collections.tasks).toBeEmptyArray();
        });

        it('should call load', function() {
            expect(mlResourcesService.load).toHaveBeenCalledWith('tasks');
        });
    });

    describe('load', function() {
        var $httpBackend, requestHandler;
        var collection = [];

        beforeEach(inject(function($resource) {
            spyOn(mlResourcesService, 'getResource').and.returnValue($resource('/api/tasks/:id.json', {id: '@id'}));
            spyOn(mlResourcesService, 'getCollection').and.returnValue(collection);
        }));

        beforeEach(inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            //requestHandler = $httpBackend.when('GET', 'api/jobs').respond([{id: 1, name: 'test'}, {id: 2, name: 'test2'}]);
        }));

        it('should fetch collection', function() {
            //$httpBackend.expectGET('/api/jobs.json');
            /*$httpBackend.when('GET', 'api/tasks').respond([{id: 1, name: 'test'}, {id: 2, name: 'test2'}]);
            mlResourcesService.load('tasks');
            $httpBackend.flush();*/
        });
    });
});