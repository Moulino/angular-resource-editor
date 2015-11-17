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
                    tdate: '2014-05-10'
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