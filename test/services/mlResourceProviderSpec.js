describe('mlResources provider : ', function() {

    var provider, Restangular, mlResource;

    beforeEach(module('mlResourceEditor', function($provide, mlResourceProvider) {
        provider = mlResourceProvider;

        provider.addResource({
            name: 'foo',
            uri: '/api/foo',
        });

        Restangular = jasmine.createSpyObj('Restangular', [
            'all',
            'setBaseUrl', 
            'setDefaultHeaders',
            'setRestangularFields',
            'setSelfLinkAbsoluteUrl',
            'addResponseInterceptor',
            'addRequestInterceptor'
        ]);

        $provide.value('Restangular', Restangular);
    }));

    beforeEach(inject(function(_mlResource_) {
        mlResource = _mlResource_;
    }));

    describe('init', function() {
        it('should init resources', function() {
            mlResource.init();
            expect(provider.resources).toHaveMember('foo');
        });
    });

    describe('get', function() {
        it('should return the resource', function() {
            provider.resources.foo = 'bar';
            expect(mlResource.get('foo')).toEqual('bar');
        });
    });

    describe('getOptions', function() {
        it('should return the options', function() {
            provider.options.foo = 'bar';
            expect(mlResource.getOptions('foo')).toEqual('bar');
        });
    });

    describe('createResource', function() {
        it('should return a new object initalized', function() {
            provider.options.foo = {
                fields: [
                    {type: 'date', model: 'date'},
                    {type: 'select', model: 'select'},
                    {type: 'number', model: 'number'},
                    {type: 'text', model: 'text'}
                ]
            };

            var item = mlResource.createResource('foo');
            expect(item.date).toBeDate();
            expect(item.select).toBeNull();
            expect(item.number).toEqual(0);
            expect(item.text).toBeEmptyString();
        });
    });
});