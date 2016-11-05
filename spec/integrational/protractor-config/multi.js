var env = require('../environment');

exports.config = {
    seleniumAddress: env.seleniumAddress,
    framework: 'jasmine2',
    specs: ['../protractor/multi-browser-instance-test.js'],
    plugins: [{
        path: '../../../index.js',
        screenshotPath: '.tmp/multi'
    }]
};
