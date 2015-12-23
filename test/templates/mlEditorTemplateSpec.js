describe('mlEditorTemplate', function() {

	beforeEach(module('mlResourceEditor'));

	it('should put the template in the cache', inject(function($templateCache) {
		expect($templateCache.get('mlEditorTemplate.html')).not.toBeEmptyString();
	}));
});