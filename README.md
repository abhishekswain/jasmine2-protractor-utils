[![npm](https://img.shields.io/npm/dm/jasmine2-protractor-utils.svg?style=flat-square)](https://www.npmjs.com/package/jasmine2-protractor-utils)
[![npm](https://img.shields.io/npm/dt/jasmine2-protractor-utils.svg?style=flat-square)](https://www.npmjs.com/package/jasmine2-protractor-utils)

[![npm](https://img.shields.io/npm/v/jasmine2-protractor-utils.svg?style=flat-square)](https://www.npmjs.com/package/jasmine2-protractor-utils)
[![npm](https://img.shields.io/npm/l/jasmine2-protractor-utils.svg?style=flat-square)](https://www.npmjs.com/package/jasmine2-protractor-utils)

# jasmine2-protractor-utils
Utilities for Protractor with jasmine2 [Screenshot, Browser Console log and more]

1. This plugin can take a screenshot for each Jasmine2 expect failure
2. It can take screenshot for each spec failure as well
3. It can fail your spec/test if browser console has errors
4. It can generate beautiful readable HTML reports
5. TODO: It can output browser console logs on failure(Done) or always(TODO) :)

# Usage

## How to install

npm install jasmine2-protractor-utils -g

*To install a particular version:* npm install jasmine2-protractor-utils@version


Add this plugin to the protractor config file:
```js
exports.config = {
      plugins: [{
        package: 'jasmine2-protractor-utils',
        disableHTMLReport: {Boolean},
        disableScreenshot: {Boolean},
        screenshotOnExpectFailure: {Boolean}    (Default - false),
        screenshotOnSpecFailure: {Boolean}      (Default - false),
        screenshotPath: {String}                (Default - 'reports/screenshots')
        clearFoldersBeforeTest: {Boolean}       (Default - false),
        htmlReportDir:  {String}                (Default - './reports/htmlReports')
        failTestOnErrorLog: {
                    failTestOnErrorLogLevel: {Number},  (Default - 900)
                    excludeKeywords: {A JSON Array}
                }
      }]
    };
```

Example:

```js
exports.config = {
      plugins: [{
        package: 'jasmine2-protractor-utils',
        disableHTMLReport: false,
        disableScreenshot: false,
        screenshotPath:'./reports/screenshots',
        screenshotOnExpectFailure:true,
        screenshotOnSpecFailure:true,
        clearFoldersBeforeTest: true,
        htmlReportDir: './reports/htmlReports',
        failTestOnErrorLog: {
                    failTestOnErrorLogLevel: 900,
                    excludeKeywords: ['keyword1', 'keyword2']
                }
      }]
    };
```


**Please Note**

If you are using **failTestOnErrorLog** feature, there should be an **onPrepare:** block in your Protractor config which returns a promise.
If not present , please add the following to the config file:

```js
 onPrepare: function () {

        // returning the promise makes protractor wait for the reporter config before executing tests
        return global.browser.getProcessedConfig().then(function (config) {

        });
        }
```

## package

 This is the plugin package name , same as of npm module name for the plugin , 'jasmine2-protractor-utils' usually and preferably


## disableHTMLReport

 If set to 'true', disables HTML report generation.

 Valid Options: true/false


## disableScreenshot

 If set to 'true' , disables screenshot generation.

 Valid Options: true/false


## screenshotOnExpectFailure

 Takes a screenshot for each Jasmine2 expect failure, is set true.
 Screenshot will be taken in 'png' format and file name would be: description+spec description+index.png

 Default: false


## screenshotOnSpecFailure

 Take screenshot for each spec failure , if set to true.
 Screenshot will be taken in 'png' format and file name would be: description+spec description.png

 Default: false


## screenshotPath

 Path where screenshots will be saved. If path does not exist , will be created.
 e.g './reports/something/savehere/' , please take care of './' and '/' at the beginning and end.

 Default: 'reports/screenshots'

## clearFoldersBeforeTest

 If this flag set to true, screenshot and html report directories will be emptied before generating new reports and screenshots

 Default: false

## htmlReportDir

 Path where HTML report will be saved. If path does not exist , will be created.
 e.g './reports/something/savehere/'

 If you want to use the default location , never mention 'htmlReportDir' with the plug in configuration. Where as 'disableHTMLReport' must be set to false.

 Default: 'reports/htmlReports'

## failTestOnErrorLog (Chrome only)

Contains a set of configuration for console log. When browser console has errors of a certain log level (default:>900), the spec/test is marked failed along with log in the error report/stacktrace.

### failTestOnErrorLogLevel

Log level, test fails of the browser console log has logs **more than** this specified level.

Default: 900

### excludeKeywords

An array of keywords to be excluded , while searching for error logs. i.e If a log contains any of these keywords , spec/test will not be marked failed.

Please do not specify this flag , if you don't supply any such keywords.


## TODO

It can output browser console logs on failure(done) or always(TODO) :)