var q = require('q');
var fs = require('fs');
var fse = require('fs-extra');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var pug = require('pug');
var uuid = require('uuid');
var moment = require('moment');

/**
 * This plugin does few things:
 *   1. Takes a screenshot for each jasmine expect/matcher failure
 *   2. Takes a screenshot for each test/spec failure
 *   3. Genrates a HTML report
 *   4. Marks the test as failure if browser console log has error - Chrome only //TODO
 *
 *    exports.config = {
 *      plugins: [{
 *      package: 'jasmine2-protractor-utils',
 *      screenshotOnExpect: {String}    (Default - 'failure+success', 'failure', 'none'),
 *      screenshotOnSpec: {String}    (Default - 'failure+success', 'failure', 'none'),
 *      withLogs: {Boolean}       (Default - true),
 *      htmlReport: {Boolean}      (Default - true),
 *      screenshotPath: {String}                (Default - 'reports/screenshots')
 *      clearFoldersBeforeTest: {Boolean}       (Default - false),
 *      failTestOnErrorLog: {
 *               failTestOnErrorLogLevel: {Number},  (Default - 900)
 *               excludeKeywords: {A JSON Array}
 *          }
 *       }]
 *    };
 *    @author Abhishek Swain, Andrej Zachar
 *    @blog www.qaautomationsimplified.com
 *    @created December 01 2015
 */
var protractorUtil = function() {};

protractorUtil.forEachBrowser = function(action) {
    if (global.screenshotBrowsers && Object.keys(global.screenshotBrowsers).length > 0) {
        _.forOwn(global.screenshotBrowsers, function(instance, name) {
            action(instance, name);
        });
    } else {
        action(global.browser, 'default');
    }
};

protractorUtil.takeScreenshot = function(config, context, report) {

    function takeInstanceScreenshot(browserInstance, browserName) {
        var screenshotFile = 'screenshots/' + uuid.v1() + '.png';
        console.log('Taking screenshot ' + screenshotFile + ' from browser instance ' + browserName);
        var finalFile = context.config.screenshotPath + '/' + screenshotFile;

        browserInstance.takeScreenshot().then(function(png) {
            var stream = fs.createWriteStream(finalFile);
            stream.write(new Buffer(png, 'base64'));
            stream.end();
            report(screenshotFile, browserName);
        }, function(err) {
            console.log('Error while taking screenshot - ' + err.message);
        });
    }

    protractorUtil.forEachBrowser(takeInstanceScreenshot);
};

protractorUtil.takeLogs = function(config, context, report) {

    function takeLog(browserInstance, browserName) {
        console.log('Taking logs from browser instance ' + browserName);
        try {
            browserInstance.manage().logs().get('browser').then(function(browserLogs) {
                if (browserLogs && browserLogs.length > 0) {
                    report(browserLogs, browserName);
                }
            });
        } catch (err) {
            console.log('Error while taking logs - ' + err);
        }
    }

    protractorUtil.forEachBrowser(takeLog);
};

/**
 * Takes a screenshot for each expect/matcher
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise
 */
protractorUtil.takeScreenshotOnExpectDone = function(context) {
    return browser.getProcessedConfig().then(function(config) {
        //Takes screen shot for expect failures
        var originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
        jasmine.Spec.prototype.addExpectationResult = function(passed, expectation) {
            var self = this;

            expectation.screenshots = [];
            expectation.logs = [];
            expectation.when = new Date();

            var makeScreenshotsFromEachBrowsers = false;
            if (passed) {
                protractorUtil.test.passedExpectations.push(expectation);
                makeScreenshotsFromEachBrowsers = context.config.screenshotOnExpect == 'failure+success';
            } else {
                protractorUtil.test.failedExpectations.push(expectation);
                makeScreenshotsFromEachBrowsers = context.config.screenshotOnExpect == 'failure+success' || context.config.screenshotOnExpect == 'failure';
            }
            if (makeScreenshotsFromEachBrowsers) {
                protractorUtil.takeScreenshot(config, context, function(file, browserName) {
                    expectation.screenshots.push({
                        img: file,
                        browser: browserName,
                        when: new Date()
                    });
                    protractorUtil.writeReport(context);
                });
            }
            if (context.config.withLogs) {
                protractorUtil.takeLogs(config, context, function(logs, browserName) {
                    expectation.logs.push({
                        logs: logs,
                        browser: browserName
                    });
                    protractorUtil.writeReport(context);
                });
            }
            return originalAddExpectationResult.apply(this, arguments);
        };
    });
};


/**
 * Takes a screenshot for each jasmine spec (it) failure
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise
 */
protractorUtil.takeScreenshotOnSpecDone = function(context) {
    return browser.getProcessedConfig().then(function(config) {
        jasmine.getEnv().addReporter((function() {
            return {
                jasmineStarted: function() {
                    global.screenshotBrowsers = {};
                },
                specDone: function(result) {
                    var makeScreenshotsFromEachBrowsers = false;
                    if (result.failedExpectations.length === 0) {
                        makeScreenshotsFromEachBrowsers = context.config.screenshotOnSpec == 'failure+success';
                    } else {
                        makeScreenshotsFromEachBrowsers = context.config.screenshotOnSpec == 'failure+success' || context.config.screenshotOnSpec == 'failure';
                    }
                    if (makeScreenshotsFromEachBrowsers) {
                        protractorUtil.takeScreenshot(config, context, function(file, browserName) {
                            protractorUtil.test.specScreenshots.push({
                                img: file,
                                browser: browserName,
                                when: new Date()
                            });
                        });
                    }
                    if (context.config.withLogs) {
                        protractorUtil.takeLogs(config, context, function(logs, browserName) {
                            protractorUtil.test.specLogs.push({
                                logs: logs,
                                browser: browserName
                            });
                        });
                    }
                }
            };
        })());
    });
};

protractorUtil.writeReport = function(context) {
    var file = context.config.screenshotPath + '/report.js';
    console.log('Generating ' + file);

    var data = JSON.stringify({
        tests: protractorUtil.testResults,
        generatedOn: new Date()
    });

    var before = "angular.module('reporter').constant('data',";
    var after = ");";

    fse.outputFile(file, before + data + after, function(err) {
        if (err) console.log(err);
    });
};

protractorUtil.installReporter = function(context) {
    var dest = context.config.screenshotPath + '/';
    console.log('Creating reporter at ' + dest);

    try {
        fse.copySync(__dirname + '/reporter/dist', dest);
    } catch (err) {
        console.error(err);
    }
};

protractorUtil.generateHTMLReport = function(context) {

    return browser.getProcessedConfig().then(function(config) {
        jasmine.getEnv().addReporter((function() {
            return {
                jasmineStarted: function() {
                    protractorUtil.testResults = [];
                    protractorUtil.installReporter(context);
                },
                specStarted: function(result) {
                    protractorUtil.test = {
                        start: moment(),
                        specScreenshots: [],
                        specLogs: [],
                        failedExpectations: [],
                        passedExpectations: []
                    };
                    protractorUtil.testResults.push(protractorUtil.test);
                },
                specDone: function(result) {
                    //calculate diff
                    protractorUtil.test.end = moment();
                    protractorUtil.test.diff = protractorUtil.test.end.diff(protractorUtil.test.start, 'ms');
                    protractorUtil.test.timeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

                    _.merge(protractorUtil.test, result);
                    protractorUtil.writeReport(context);
                },
                jasmineDone: function() {
                    protractorUtil.writeReport(context);
                }
            };
        })());
    });
};

/**
 * Fails the test/spec if browser has console logs
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise
 */
protractorUtil.failTestOnErrorLog = function(context) {
    return global.browser.getProcessedConfig().then(function(config) {
        beforeEach(function() {
            /*
             * A Jasmine custom matcher
             */
            var matchers = {
                toEqualBecause: function() {

                    return {
                        compare: function(actual, expected, custMsg) {
                            var result = {
                                pass: jasmine.pp(actual) === jasmine.pp(expected),
                                message: 'Expected ' + jasmine.pp(actual) + ' to equal ' + jasmine.pp(expected) + ' Because: ' + custMsg
                            };
                            return result;
                        }
                    };
                }
            };
            global.jasmine.addMatchers(matchers);

        });

        afterEach(function() {
            /*
             * Verifies that console has no error logs, if error log is there test is marked as failure
             */
            function verifyConsole(browserLogs, browserName) {

                // browserLogs is an array of objects with level and message fields
                if (browserLogs) {
                    browserLogs.forEach(function(log) {
                        var logLevel = context.config.failTestOnErrorLog.failTestOnErrorLogLevel ? context.config.failTestOnErrorLog.failTestOnErrorLogLevel : 900;
                        var flag = false;
                        if (log.level.value > logLevel) { // it's an error log
                            if (context.config.failTestOnErrorLog.excludeKeywords) {
                                context.config.failTestOnErrorLog.excludeKeywords.forEach(function(keyword) {
                                    if (log.message.search(keyword) > -1) {
                                        flag = true;
                                    }
                                });
                            }
                            expect(log.level.value > logLevel && flag).toEqualBecause(true, 'Browser instance ' + browserName + ': Error logs present in console:' + require('util').inspect(log));
                        }
                    });
                }
            }

            protractorUtil.takeLogs(config, context, verifyConsole);
        });
    });
};

/**
 * Creates the screenshot storage folder
 * Calls relevant methods to achieve the desired tasks
 */
protractorUtil.prototype.setup = function() {
    var self = this;

    if (!this.config.screenshotPath) {
        this.config.screenshotPath = './reports/e2e';
    }

    if (this.config.clearFoldersBeforeTest) {
        try {
            fse.removeSync(this.config.screenshotPath);
        } catch (err) {
            console.error(err);
        }
    }

    mkdirp.sync(this.config.screenshotPath + '/screenshots', function(err) {
        if (err) console.error(err);
        else console.log(self.config.screenshotPath + ' folder created!');
    });

    //must be registered as a first one
    if (this.config.htmlReport || this.config.htmlReport === undefined) {
        protractorUtil.generateHTMLReport(this);
    } else {
        protractorUtil.test = {
            specScreenshots: [],
            specLogs: [],
            failedExpectations: [],
            passedExpectations: []
        };
    }

    if (this.config.withLogs === undefined) {
        this.config.withLogs = true;
    }

    if (this.config.screenshotOnExpect === undefined) {
        this.config.screenshotOnExpect = 'failure+success';
    }

    if (this.config.screenshotOnSpec === undefined) {
        this.config.screenshotOnSpec = 'failure+success';
    }

    if (this.config.screenshotOnExpect != 'none') {
        protractorUtil.takeScreenshotOnExpectDone(this);
    }
    if (this.config.screenshotOnSpec != 'none') {
        protractorUtil.takeScreenshotOnSpecDone(this);
    }
    if (this.config.failTestOnErrorLog) {
        protractorUtil.failTestOnErrorLog(this);
    }
};

var protractorUtill = new protractorUtil();

module.exports = protractorUtill;
