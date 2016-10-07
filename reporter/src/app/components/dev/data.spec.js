describe('contstant testResults', () => {
  beforeEach(angular.mock.module('reporter'));

  it('should be registered', inject(data => {
    expect(data).not.toBeNull();
  }));

  it('should return array of object', inject(data => {
    expect(data).toEqual(jasmine.any(Object));
    expect(data.generatedOn).toEqual(jasmine.any(String));
    expect(data.tests).toEqual(jasmine.any(Array));
    expect(data.tests[0]).toEqual(jasmine.any(Object));
  }));
});
