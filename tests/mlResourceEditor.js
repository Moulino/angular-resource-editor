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

    describe('displayInDialog', function() {
        var mdDialog;

        beforeEach(inject(function(_$mdDialog_) {
            mdDialog = _$mdDialog_;
        }));

        it('should call getOptions', function() {
            spyOn(mlResources, 'getOptions').and.returnValue({});
            mlResources.displayInDialog('tasks');

            expect(mlResources.getOptions).toHaveBeenCalledWith('tasks');
        });

        it('should display a dialog box', function() {
            spyOn(mdDialog, 'show');
            mlResources.displayInDialog('tasks');

            expect(mdDialog.show).toHaveBeenCalled();
        });
    });
});

describe('mlFormDialog factory : ', function() {
    var mlFormDialog, $mdDialog;

    beforeEach(module('mlResourceEditor'));
    beforeEach(inject(function(_mlFormDialog_, _$mdDialog_) {
        mlFormDialog = _mlFormDialog_;
        $mdDialog = _$mdDialog_;
    }));

    describe('open', function() {
        it('should display dialog', function() {
            spyOn($mdDialog, 'show');
            mlFormDialog.open();
            expect($mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('close', function() {
        it('should hide dialog', function() {
            spyOn($mdDialog, 'hide');
            mlFormDialog.close();
            expect($mdDialog.hide).toHaveBeenCalled();
        });
    });
});

describe('mlResourceEditor directive : ', function() {
    var $compile,
        $rootScope;

    beforeEach(module('mlResourceEditor'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should integrate template', function() {
        var node = $compile("<div ml-resource-editor></div>");
        $rootScope.$digest();
    });

});