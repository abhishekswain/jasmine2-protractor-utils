var q = require('q');
var fs = require('fs');
var fse = require('fs-extra');
var mkdirp = require('mkdirp');
var jasmine2Reporter = require('./reporter/jasmine2_reporter.js');

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
 *      screenshotOnExpectFailure: {Boolean}    (Default - false),
 *      screenshotOnSpecFailure: {Boolean}      (Default - false),
 *      screenshotPath: {String}                (Default - 'reports/screenshots')
 *      clearFoldersBeforeTest: {Boolean}       (Default - false),
 *      htmlReportDir:  {String}                (Default - './reports/htmlReports')
 *      failTestOnErrorLog: {
 *               failTestOnErrorLogLevel: {Number},  (Default - 900)
 *               excludeKeywords: {A JSON Array}
 *          }
 *       }]
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

            if (config.capabilities.name) {
                var configName = config.capabilities.name + "-";
            }
            //Takes screen shot for expect failures
            var originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
            jasmine.Spec.prototype.addExpectationResult = function () {
                var self = this;

                if (!arguments[0]) {
                    // take screenshot
                    global.browser.takeScreenshot().then(function (png) {

                        var fileName = (configName ? configName : "") + (config.capabilities.browserName + '-' + self.result.fullName + '-' + 'expect failure-' + protractorUtil.index++).replace(/[\/\\]/g, ' ');
                        if (fileName.length > 245) {
                            fileName = ((configName ? configName : "") + (config.capabilities.browserName + '-' + self.result.fullName).replace(/[\/\\]/g, ' ')).substring(0, 230) + '-' + 'expect failure-' + protractorUtil.index++;
                        }

                        if (context.config.screenshotPath) {
                            if (((context.config.screenshotPath.charAt(context.config.screenshotPath.length - 1)) != '/') || ((context.config.screenshotPath.charAt(context.config.screenshotPath.length - 1)) != '\\')) {
                                var screenshotPathUserSupplied = context.config.screenshotPath + '/';
                            }
                        }

                        var stream = fs.createWriteStream((screenshotPathUserSupplied ? screenshotPathUserSupplied.replace('./', '') : 'reports/screenshots/') + fileName + '.png');
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
            if (config.capabilities.name) {
                var configName = config.capabilities.name + "-";
            }

            jasmine.getEnv().addReporter((function () {
                return{
                    specDone: function (result) {
                        if (result.failedExpectations.length > 0) {
                            // take screenshot
                            browser.takeScreenshot().then(function (png) {
                                var fileName = (configName ? configName : "") + (config.capabilities.browserName + '-' + result.fullName).replace(/[\/\\]/g, ' ');
                                if (fileName.length > 245) {
                                    fileName = ((configName ? configName : "") + (config.capabilities.browserName + '-' + result.fullName).replace(/[\/\\]/g, ' ')).substring(0, 230);
                                }

                                if (context.config.screenshotPath) {
                                    if (((context.config.screenshotPath.charAt(context.config.screenshotPath.length - 1)) != '/') || ((context.config.screenshotPath.charAt(context.config.screenshotPath.length - 1)) != '\\')) {
                                        var screenshotPathUserSupplied = context.config.screenshotPath + '/';
                                    }
                                }

                                var stream = fs.createWriteStream((screenshotPathUserSupplied ? screenshotPathUserSupplied.replace('./', '') : 'reports/screenshots/') + fileName + '.png');
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
 * Generates HTML report for tests
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise
 */
protractorUtil.generateHTMLReport = function (context) {

    return global.browser.getProcessedConfig().then(function (config) {

        if (context.config.htmlReportDir) {
            return global.browser.getProcessedConfig().then(function (config) {
                var screenshotLocation = context.config.screenshotPath ? context.config.screenshotPath : '.reports/screenshots';
                jasmine.getEnv().addReporter(new jasmine2Reporter(context.config.htmlReportDir, screenshotLocation, config));
            });
        }

        else {

            return global.browser.getProcessedConfig().then(function (config) {
                var screenshotLocation = context.config.screenshotPath ? context.config.screenshotPath : '.reports/screenshots';
                jasmine.getEnv().addReporter(new jasmine2Reporter('./reports/htmlReports', screenshotLocation, config));
            });
        }
    });
};

/**
 * Fails the test/spec if browser has console logs
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise
 */
protractorUtil.failTestOnErrorLog = function (context) {

    if (context.config.failTestOnErrorLog) {
        return global.browser.getProcessedConfig().then(function (config) {


            beforeEach(function () {

                /*
                 * A Jasmine custom matcher
                 */
                var matchers = {
                    toEqualBecause: function () {

                        return {
                            compare: function (actual, expected, custMsg) {
                                var result = {
                                    pass: jasmine.pp(actual) === jasmine.pp(expected),
                                    message: 'Expected ' + jasmine.pp(actual) + ' to equal ' + jasmine.pp(expected) + ' Because: ' + custMsg
                                };
                                return result;
                            }
                        };
                    } };
                global.jasmine.addMatchers(matchers);

            });

            afterEach(function () {

                /*
                 * Verifies that console has no error logs, if error log is there test is marked as failure
                 */
                global.browser.manage().logs().get('browser').then(function (browserLogs) {

                    // browserLogs is an array of objects with level and message fields
                    if (browserLogs) {
                        browserLogs.forEach(function (log) {
                            var logLevel = context.config.failTestOnErrorLog.failTestOnErrorLogLevel ? context.config.failTestOnErrorLog.failTestOnErrorLogLevel : 900;
                            var flag = false;
                            if (log.level.value > logLevel) { // it's an error log
                                if (context.config.failTestOnErrorLog.excludeKeywords) {
                                    context.config.failTestOnErrorLog.excludeKeywords.forEach(function (keyword) {
                                        if (log.message.search(keyword) > -1) {
                                            flag = true;
                                        }
                                    });
                                }
                                expect(log.level.value > logLevel && flag).toEqualBecause(true, 'Error logs present in console:' + require('util').inspect(log));
                            }
                        });
                    }
                });
            });
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
//        var reportsDir = './reports';
//        if (!fs.existsSync(reportsDir)) {
//            fs.mkdirSync(reportsDir);
//        }

        if (this.config.clearFoldersBeforeTest) {
            try {
                fse.removeSync('./reports/screenshots');
            } catch (err) {
                console.error(err);
            }
        }

        if (!this.config.disableScreenshot) {

            //creates screenshots folder if does not exist
            var screenshotDir = './reports/screenshots';

            mkdirp.sync(screenshotDir, function (err) {
                if (err) console.error(err);
                else console.log(htmlReportsDir + ' folder created!');
            });

        }

    }
    else {

        if (this.config.clearFoldersBeforeTest) {
            try {
                fse.removeSync(this.config.screenshotPath);
            } catch (err) {
                console.error(err);
            }
        }

        mkdirp.sync(this.config.screenshotPath, function (err) {
            if (err) console.error(err);
            else console.log(self.config.screenshotPath + ' folder created!');
        });
    }


    if (!this.config.htmlReportDir) {



        //creates htmlReports folder if does not exist
        var htmlReportsDir = './reports/htmlReports';

        if (this.config.clearFoldersBeforeTest) {
            try {
                fse.removeSync(htmlReportsDir);
            } catch (err) {
                console.error(err);
            }
        }

        if (!this.config.disableHTMLReport) {

            mkdirp.sync(htmlReportsDir, function (err) {
                if (err) console.error(err);
                else console.log(htmlReportsDir + ' folder created!');
            });


        }
    }
    else {
        if (this.config.clearFoldersBeforeTest) {
            try {
                fse.removeSync(this.config.htmlReportDir);
            } catch (err) {
                console.error(err);
            }
        }

        mkdirp.sync(this.config.htmlReportDir, function (err) {
            if (err) console.error(err);
            else console.log(self.config.htmlReportDir + ' folder created!');
        });
    }
    if (!this.config.disableScreenshot) {
        protractorUtil.takeScreenshotOnExpectFail(this);
        protractorUtil.takeScreenshotOnSpecFail(this);
    }
    protractorUtil.failTestOnErrorLog(this);
    if (!this.config.disableHTMLReport) {
        protractorUtil.generateHTMLReport(this);
    }

};

/**
 * Increases the index by one after each spec has run
 */
protractorUtil.prototype.postTest = function () {
    protractorUtil.index = 0;

};

protractorUtil.prototype.postResults = function () {
    var self = this;
    return global.browser.getProcessedConfig().then(function (config) {
        var htmlDir = self.config.htmlReportDir ? self.config.htmlReportDir : './reports/htmlReports';


        var files = fs.readdirSync(htmlDir);
        var finalSuites = [];
        files.forEach(function (file, index) {
            if ((file.search('.json') > -1) && (file.toString() !== 'data.json')) {
                var contents = fs.readFileSync(htmlDir + '/' + file).toString();
                finalSuites = finalSuites.concat(JSON.parse(contents.replace('data = ', '')).suites);
            }
        });

        var resultToWrite = 'data = ' + '{ suites:' + JSON.stringify(finalSuites) + '}';
        if (finalSuites.length > 0) {

            fs.writeFileSync(htmlDir + '/data.json', resultToWrite, 'utf-8');
        }
    });
};

var protractorUtill = new protractorUtil();

module.exports = protractorUtill;
