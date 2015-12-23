describe('mlListTemplate', function() {

	beforeEach(module('mlResourceEditor'));

	it('should put the template in the cache', inject(function($templateCache) {
		expect($templateCache.get('mlListTemplate.html')).not.toBeEmptyString();
	}));
});