describe('mlCollection service', function() {

	var mlResource = {};
	var factory,
		$q,
		$rootScope;

	var setMetadata = function(name, key, value) {
		var collection = factory.get(name);
		collection.metadata = collection.metadata || {};
		collection.metadata[key] = value;
	};

	beforeEach(module('mlResourceEditor', function($provide) {
		$provide.value('mlResource', mlResource);
	}));

	beforeEach(inject(function(mlCollection, _$q_, _$rootScope_) {
		factory = mlCollection;
		$q = _$q_;
		$rootScope = _$rootScope_;
	}));

	describe('load', function() {
		var resource, deferred, filters;

		beforeEach(function() {
			deferred = $q.defer();

			mlResource.getOptions = jasmine.createSpy('getOptions').and.returnValue({filters: filters});

			resource = {
				getList: jasmine.createSpy('getList').and.returnValue(deferred.promise)
			};

			spyOn(factory, 'getResource').and.returnValue(resource);
			spyOn(factory, 'addToCollection');
		})

		it('should load data', function() {
			var filters = {
				'order[name]': 'ASC'
			};

			mlResource.getOptions = jasmine.createSpy('getOptions').and.returnValue({filters: filters});
			
			factory.load('tasks');
			expect(mlResource.getOptions).toHaveBeenCalledWith('tasks');
			expect(resource.getList).toHaveBeenCalledWith(filters);
			expect(factory.exist('tasks')).toBeTrue();

			var items = [{id: 1}, {id: 2}];
			items.metadata = {test: 'test'};

			deferred.resolve(items);
			$rootScope.$apply();
			
			var collection = factory.get('tasks');
			expect(collection.metadata.test).toEqual('test');
			expect(factory.addToCollection.calls.count()).toEqual(2);
		});

		it('should clear collection if request failed', function() {

			var collection = factory.get('tasks');
			collection.push({id: 1});
			collection.push({id: 2});

			expect(factory.get('tasks').length).toEqual(2);
			factory.load('tasks');
			deferred.reject('test error');
			$rootScope.$apply();
			expect(factory.get('tasks').length).toEqual(0);
		});
	});

	describe('addToCollection', function() {
		it('should append item to collection', function() {
			factory.addToCollection('tasks', {id: 1});

			var collection = factory.get('tasks');
			expect(collection[0]).toHaveMember('id');
		});

		it('should convert a date field', function() {
			mlResource.getOptions = jasmine.createSpy('getOptions').and.returnValue({
				fields: [{type: 'date', model: 'tdate'}]
			});

			factory.addToCollection('tasks', {tdate: '12-01-2015'});
			var collection = factory.get('tasks');
			expect(collection[0].tdate).toBeDate();
		})
	});

	describe('create', function() {
		it('should add a new emtpy collection', function() {
			expect(factory.exist('task1')).toBeFalse();
			factory.create('task1');
			expect(factory.exist('task1')).toBeTrue();
		});
	});

	describe('exist', function() {
		it('should return true if collection exists', function() {
			expect(factory.exist('test')).toBeFalse();
		});

		it("should return false if collection doesn't exists", function() {
			factory.create('test');
			expect(factory.exist('test')).toBeTrue();
		});
	});

	describe('clear', function() {
		it('should clean collection', function() {
			var collection = factory.get('tasks');
			collection.push({id: 1});
			collection.push({id: 2});

			expect(factory.get('tasks').length).toEqual(2);
			factory.clear('tasks');
			expect(factory.get('tasks').length).toEqual(0);
		});
	});

	describe('reload', function() {
		it('should re-load the current page', function() {
			factory.getPage = jasmine.createSpy('getPage').and.returnValue(2);
			factory.load = jasmine.createSpy('load');

			factory.reload('tasks');
			expect(factory.getPage).toHaveBeenCalledWith('tasks');
			expect(factory.load).toHaveBeenCalledWith('tasks', 2);
		});
	});

	describe('getMetadata', function() {
		it('should return the value from key', function() {
			var collection = factory.get('tasks');
			collection['metadata'] = {
				foo: 'bar'
			};

			expect(factory.getMetadata('tasks', 'foo')).toEqual('bar');
		});
	});

	describe('getResource', function() {
		it('should get resource', function() {
			mlResource.get = jasmine.createSpy('get');

			factory.getResource('tasks');
			expect(mlResource.get).toHaveBeenCalledWith('tasks');
		});
	});

	describe('getPage', function() {
		it('should extract the number of the page from metadata', function() {
			setMetadata('tasks', 'href', 'http://foo/api?page=6');
			expect(factory.getPage('tasks')).toEqual(6);
		});

		it('should return 1 if the number of page is unfound', function() {
			expect(factory.getPage('tasks')).toEqual(1);
		});
	});

	describe('getNumberOfPages', function() {
		it("should return the good number of pages", function() {
			factory.getTotalItems = function() {return 46;}
			factory.getItemsPerPage = function() {return 15;}
			expect(factory.getNumberOfPages('tasks')).toEqual(4);

			factory.getTotalItems = function() {return 45;}
			expect(factory.getNumberOfPages('tasks')).toEqual(3);
		});
	});

	describe('getTotalItems', function() {
		it('should extract the value from metadata', function() {
			setMetadata('foo', 'hydra:totalItems', 17);
			expect(factory.getTotalItems('foo')).toEqual(17);
		});
	});

	describe('getItemsPerPage', function() {
		it('should extract the value from metadata', function() {
			setMetadata('foo', 'hydra:itemsPerPage', 10);
			expect(factory.getItemsPerPage('foo')).toEqual(10);
		});
	});

	describe('isLastPage', function() {
		it('should return true if nextPage is not defined in metadata', function() {
			expect(factory.isLastPage('foo')).toBeTrue();
		});

		it('should return false if nextPage is defined in metadata', function() {
			setMetadata('foo', 'hydra:nextPage', 'bar');
			expect(factory.isLastPage('foo')).toBeFalse();
		});
	});

	describe('isFirstPage', function() {
		it('should return true if previousPage is not defined in metadata', function() {
			expect(factory.isFirstPage('foo')).toBeTrue();
		});

		it('should return false if previousPage is defined in metadata', function() {
			setMetadata('foo', 'hydra:previousPage', 'bar');
			expect(factory.isFirstPage('foo')).toBeFalse();
		});
	});
});

