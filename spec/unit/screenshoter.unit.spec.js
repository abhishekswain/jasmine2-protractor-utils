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
        expect(screenshoter.config.reportFile).toBeDefined();
        delete screenshoter.config.reportFile;
        expect(screenshoter.config).toEqual({
            screenshotPath: './reports/e2e',
            withLogs: true,
            screenshotOnExpect: 'failure+success',
            screenshotOnSpec: 'failure+success',
            clearFoldersBeforeTest: true,
            htmlReport: true,
            writeReportFreq: 'end'
        });
    });

    it("should keep framework specific config", function() {
        screenshoter.config = {
            path: './bla/bla'
        };
        screenshoter.setup();
        expect(screenshoter.config.reportFile).toBeDefined();
        delete screenshoter.config.reportFile;
        expect(screenshoter.config).toEqual({
            screenshotPath: './reports/e2e',
            withLogs: true,
            screenshotOnExpect: 'failure+success',
            screenshotOnSpec: 'failure+success',
            clearFoldersBeforeTest: true,
            htmlReport: true,
            writeReportFreq: 'end',
            path: './bla/bla'
        });
    });


    it("should merge user config", function() {
        screenshoter.config = {
            screenshotPath: 'REPORTS',
            screenshotOnSpec: 'failure'
        };
        screenshoter.setup();
        expect(screenshoter.config.reportFile).toBeDefined();
        delete screenshoter.config.reportFile;
        expect(screenshoter.config).toEqual({
            screenshotPath: 'REPORTS',
            withLogs: true,
            screenshotOnExpect: 'failure+success',
            screenshotOnSpec: 'failure',
            clearFoldersBeforeTest: true,
            writeReportFreq: 'end',
            htmlReport: true
        });
    });


});
