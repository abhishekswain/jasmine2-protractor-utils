var env = require('../environment');

exports.config = {
    seleniumAddress: env.seleniumAddress,
    framework: 'jasmine2',
    specs: ['../protractor/angularjs-homepage-test.js'],
    plugins: [{
        path: '../../../index.js',
        screenshotPath: '.tmp/bug4',
        screenshotOnExpect: 'failure+success',
        screenshotOnSpec: 'failure',
        writeReportFreq: 'spec',
        clearFoldersBeforeTest: true,
        withLogs: true
    }]
};
