var q = require('q');
var fs = require('fs');
var mkdirp = require('mkdirp');

/**
 * This plugin does few things:
 *   1. Takes a screenshot for each jasmine expect/matcher failure
 *   2. Takes a screenshot for each test/spec failure
 *   3. Marks the test as failure if browser console log has error - Chrome only //TODO
 *
 *    exports.config = {
 *      plugins: [{
 *        path: 'node_modules/jasmine2-protractor-utils/index.js',
 *        screenshotOnExpectFailure: {Boolean}    (Default - false),
 *        screenshotOnSpecFailure: {Boolean}      (Default - false),
 *        screenshotPath: {String}                (Default - 'reports/screenshots')
 *      }]
 *    };
 *    @author Abhishek Swain
 *    @blog www.qaautomationsimplified.com
 *    @created December 01 2015
 */
var protractorUtil = function () {
};


/**
 * Takes a screenshot for each expect/matcher failure
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise
 */
protractorUtil.takeScreenshotOnExpectFail = function (context) {
    if (context.config.screenshotOnExpectFailure) {
        return global.browser.getProcessedConfig().then(function (config) {
            //Takes screen shot for expect failures
            var originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
            jasmine.Spec.prototype.addExpectationResult = function () {
                var self = this;

                if (!arguments[0]) {
                    // take screenshot
                    global.browser.takeScreenshot().then(function (png) {

                        var fileName = (config.capabilities.browserName + '-' + self.result.fullName + '-' + 'expect failure-' + protractorUtil.index++).replace(/[\/\\]/g, ' ');
                        var stream = fs.createWriteStream((context.config.screenshotPath ? context.config.screenshotPath.replace('./', '') : 'reports/screenshots/') + fileName + '.png');
                        stream.write(new Buffer(png, 'base64'));
                        stream.end();
                    }, function (err) {
                        console.log('Error while taking screenshot - ' + err.message);
                    });
                }
                return originalAddExpectationResult.apply(this, arguments);
            };
        });
    }
};


/**
 * Takes a screenshot for each jasmine spec (it) failure
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise
 */
protractorUtil.takeScreenshotOnSpecFail = function (context) {

    if (context.config.screenshotOnSpecFailure) {
        return global.browser.getProcessedConfig().then(function (config) {
            jasmine.getEnv().addReporter((function () {
                return{
                    specDone: function (result) {
                        if (result.failedExpectations.length > 0) {
                            // take screenshot
                            global.browser.takeScreenshot().then(function (png) {
                                var fileName = (config.capabilities.browserName + '-' + result.fullName).replace(/[\/\\]/g, ' ');
                                var stream = fs.createWriteStream((context.config.screenshotPath ? context.config.screenshotPath.replace('./', '') : 'reports/screenshots/') + fileName + '.png');
                                stream.write(new Buffer(png, 'base64'));
                                stream.end();
                            }, function (err) {
                                console.log('Error while taking screenshot - ' + err.message);
                            });
                        }
                    }
                };
            })());
        });
    }
};

/**
 * Appends this index number to screenshot name , in order to get a screenshot for each expect failure
 * @type {number}
 */
protractorUtil.index = 0;

/**
 * Creates the screenshot storage folder
 * Calls relevant methods to achieve the desired tasks
 */
protractorUtil.prototype.setup = function () {
    var self = this;

    if (!this.config.screenshotPath) {
        //creates reports folder if does not exist
        var reportsDir = './reports';
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        //creates screenshots folder if does not exist
        var screenshotDir = './reports/screenshots';
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir);
        }
    }
    else {


        mkdirp.sync(this.config.screenshotPath, function (err) {
            if (err) console.error(err);
            else console.log(self.config.screenshotPath + ' folder created!');
        });
    }

    protractorUtil.takeScreenshotOnExpectFail(this);
    protractorUtil.takeScreenshotOnSpecFail(this);

};

/**
 * Increases the index by one after each spec has run
 */
protractorUtil.prototype.postTest = function () {
    protractorUtil.index = 0;

};

var protractorUtill = new protractorUtil();

module.exports = protractorUtill;
