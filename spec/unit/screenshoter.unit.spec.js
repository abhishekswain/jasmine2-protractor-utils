describe("Screenshoter unit", function() {

    var screenshoter;
    beforeEach(function() {
        screenshoter = require('../../index.js');
        global.browser = jasmine.createSpyObj('browser', ['getProcessedConfig']);
        browser.getProcessedConfig.and.callFake(function() {
            return jasmine.createSpyObj('promise', ['then']);
        });
    });


    it("should be defined", function() {
        expect(screenshoter).toBeDefined();
    });

    it("should resolve a default config", function() {

        screenshoter.config = {};
        screenshoter.setup();
        expect(screenshoter.config).toEqual({
            screenshotPath: './reports/e2e',
            withLogs: true,
            screenshotOnExpect: 'failure+success',
            screenshotOnSpec: 'failure+success'
        });
    });
});
