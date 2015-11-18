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