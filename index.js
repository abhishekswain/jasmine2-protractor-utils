var fse = require('fs-extra');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var uuid = require('uuid');
var moment = require('moment');
var path = require('path');

/**
 * This plugin does few things:
 *   1. Takes a screenshot for each jasmine expect/matcher failure
 *   2. Takes a screenshot for each test/spec failure
 *   3. Generates a HTML report
 *   4. Marks the test as failure if browser console log has error - Chrome only
 *
 *    exports.config = {
 *      plugins: [{
 *      package: 'protractor-screenshoter-plugin',
 *      screenshotOnExpect: {String}    (Default - 'failure+success', 'failure', 'none'),
 *      screenshotOnSpec: {String}    (Default - 'failure+success', 'failure', 'none'),
 *      withLogs: {Boolean}       (Default - true),
 *      htmlReport: {Boolean}      (Default - true),
 *      writeReportFreq: {String}      (Default - 'end', 'spec', 'asap'),
 *      screenshotPath: {String}                (Default - 'reports/screenshots')
 *      clearFoldersBeforeTest: {Boolean}       (Default - false),
 *      failTestOnErrorLog: {
 *               failTestOnErrorLogLevel: {Number},  (Default - 900)
 *               excludeKeywords: {A JSON Array}
 *          }
 *       }]
 *    };
 *    @author Andrej Zachar, Abhishek Swain
 *    @created December 01 2015, forked on October 2016
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

protractorUtil.takeScreenshot = function(context, report) {

    function takeInstanceScreenshot(browserInstance, browserName) {
        var screenshotFile = 'screenshots/' + uuid.v1() + '.png';
        // console.log('Taking screenshot ' + screenshotFile + ' from browser instance ' + browserName);
        var finalFile = context.config.screenshotPath + '/' + screenshotFile;

        browserInstance.takeScreenshot().then(function(png) {
            var stream = fse.createWriteStream(finalFile);
            stream.write(new Buffer(png, 'base64'));
            stream.end();
            report(screenshotFile, browserName);
        }, function(err) {
            console.warn('Error in browser instance ' + browserName + ' while taking the screenshot: ' + finalFile + ' - ' + err.message);
        });
    }

    protractorUtil.forEachBrowser(takeInstanceScreenshot);
};

protractorUtil.takeLogs = function(context, report) {

    function takeLog(browserInstance, browserName) {
        // console.log('Taking logs from browser instance ' + browserName);
        browserInstance.manage().logs().get('browser').then(function(browserLogs) {
            if (browserLogs && browserLogs.length > 0) {
                report(browserLogs, browserName);
            }
        }, function(err) {
            console.warn('Error in browser instance ' + browserName + ' while taking the logs:' + err.message);
        });
    }

    protractorUtil.forEachBrowser(takeLog);
};

protractorUtil.takeScreenshotOnExpectDone = function(context) {
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
            makeScreenshotsFromEachBrowsers = context.config.screenshotOnExpect === 'failure+success';
        } else {
            protractorUtil.test.failedExpectations.push(expectation);
            makeScreenshotsFromEachBrowsers = context.config.screenshotOnExpect === 'failure+success' || context.config.screenshotOnExpect === 'failure';
        }
        if (makeScreenshotsFromEachBrowsers) {
            protractorUtil.takeScreenshot(context, function(file, browserName) {
                expectation.screenshots.push({
                    img: file,
                    browser: browserName,
                    when: new Date()
                });
                if (context.config.writeReportFreq === 'asap') {
                    protractorUtil.writeReport(context);
                }
            });
        }
        if (context.config.withLogs) {
            protractorUtil.takeLogs(context, function(logs, browserName) {
                expectation.logs.push({
                    logs: logs,
                    browser: browserName
                });
                if (context.config.writeReportFreq === 'asap') {
                    protractorUtil.writeReport(context);
                }
            });
        }
        return originalAddExpectationResult.apply(this, arguments);
    };
};


protractorUtil.takeScreenshotOnSpecDone = function(result, context) {

    var makeScreenshotsFromEachBrowsers = false;
    if (result.failedExpectations.length === 0) {
        makeScreenshotsFromEachBrowsers = context.config.screenshotOnSpec === 'failure+success';
    } else {
        makeScreenshotsFromEachBrowsers = context.config.screenshotOnSpec === 'failure+success' || context.config.screenshotOnSpec === 'failure';
    }
    if (makeScreenshotsFromEachBrowsers) {
        protractorUtil.takeScreenshot(context, function(file, browserName) {
            protractorUtil.test.specScreenshots.push({
                img: file,
                browser: browserName,
                when: new Date()
            });
        });
    }
    if (context.config.withLogs) {
        protractorUtil.takeLogs(context, function(logs, browserName) {
            protractorUtil.test.specLogs.push({
                logs: logs,
                browser: browserName
            });
        });
    }

}


protractorUtil.writeReport = function(context) {
    var file = context.config.screenshotPath + '/report.js';
    console.log('Generating ' + file);

    var ci = {
        build: process.env.CIRCLE_BUILD_NUM || 'N/A',
        branch: process.env.CIRCLE_BRANCH || 'N/A',
        sha: process.env.CIRCLE_SHA1 || 'N/A',
        tag: process.env.CIRCLE_TAG || 'N/A',
        name: process.env.CIRCLE_PROJECT_REPONAME || 'N/A'
    };

    var data = JSON.stringify({
        tests: protractorUtil.testResults,
        stat: protractorUtil.stat,
        ci: ci,
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
        var src = path.join(require.resolve('screenshoter-report-analyzer/dist/index.html'), '../');
        fse.copySync(src, dest);
        console.log('done');
    } catch (err) {
        console.error(err);
        return;
    }
};

protractorUtil.registerJasmineReporter = function(context) {

    jasmine.getEnv().addReporter({
        jasmineStarted: function() {
            protractorUtil.testResults = [];
            protractorUtil.stat = {};
            if (context.config.htmlReport) {
                protractorUtil.installReporter(context);
            }
        },
        specStarted: function(result) {
            global.screenshotBrowsers = {};

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
            if (context.config.screenshotOnSpec != 'none') {
                protractorUtil.takeScreenshotOnSpecDone(result, context);
            }

            //calcuate total fails, success and so on
            if (!protractorUtil.stat[result.status]) {
                protractorUtil.stat[result.status] = 0;
            }
            protractorUtil.stat[result.status]++;
            //calculate diff
            protractorUtil.test.end = moment();
            protractorUtil.test.diff = protractorUtil.test.end.diff(protractorUtil.test.start, 'ms');
            protractorUtil.test.timeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

            _.merge(protractorUtil.test, result);
            if (context.config.writeReportFreq === 'asap' || context.config.writeReportFreq === 'spec') {
                protractorUtil.writeReport(context);
            }
        },
        jasmineDone: function() {
            protractorUtil.writeReport(context);
        }
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

            protractorUtil.takeLogs(context, verifyConsole);
        });
    });
};

/**
 * Initialize configurtion
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


    if (this.config.withLogs === undefined) {
        this.config.withLogs = true;
    }

    if (this.config.screenshotOnExpect === undefined) {
        this.config.screenshotOnExpect = 'failure+success';
    }

    if (this.config.screenshotOnSpec === undefined) {
        this.config.screenshotOnSpec = 'failure+success';
    }

    if (this.config.htmlReport === undefined) {
        this.config.htmlReport = true;
    }

    var pjson = require('./package.json');
    console.log('Activated Protractor Screenshoter Plugin, ver. ' + pjson.version + ' (c) 2016 ' + pjson.author + ' and contributors');
    console.log('The resolved configuration is:');
    console.log(this.config);
};

/**
 * Sets reporter hooks based on the configurtion
 */
protractorUtil.prototype.onPrepare = function() {
    protractorUtil.registerJasmineReporter(this);

    if (this.config.screenshotOnExpect != 'none') {
        protractorUtil.takeScreenshotOnExpectDone(this);
    }

    if (this.config.failTestOnErrorLog) {
        return protractorUtil.failTestOnErrorLog(this);
    }
}

module.exports = new protractorUtil();
