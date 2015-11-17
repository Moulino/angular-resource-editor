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