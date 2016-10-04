[![npm](https://img.shields.io/npm/dm/jasmine2-protractor-utils.svg?style=flat-square)](https://www.npmjs.com/package/jasmine2-protractor-utils)
[![npm](https://img.shields.io/npm/dt/jasmine2-protractor-utils.svg?style=flat-square)](https://www.npmjs.com/package/jasmine2-protractor-utils)

[![npm](https://img.shields.io/npm/v/jasmine2-protractor-utils.svg?style=flat-square)](https://www.npmjs.com/package/jasmine2-protractor-utils)
[![npm](https://img.shields.io/npm/l/jasmine2-protractor-utils.svg?style=flat-square)](https://www.npmjs.com/package/jasmine2-protractor-utils)

# jasmine2-protractor-utils
Utilities for Protractor with jasmine2 [Screenshot, Browser Console log and more]

1. This plugin can take screenshots for each Jasmine2 expect success/failure on *multiple browsers instances* at once.
2. It can take screenshots for each spec failure / success as well
3. It can fail your spec/test if the main browser console has errors
4. It can generate beautiful angular+bootstrap HTML reports
5. TODO: It can output browser console logs on failure(Done) or always(TODO) :)



# How to install

npm install jasmine2-protractor-utils -g

*To install a particular version:* npm install jasmine2-protractor-utils@version

# Usage

## Single browser app
No need to setup anything special to make screenshots.

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

## Multi browser chat alike app

In order to use multi-browser chat alike testing, you need to keep a track of all browser instances by yourself:

You can do it like this
```
var a  = browser.forkNewInstance();
var b  = browser.forkNewInstance();

global.screenshotBrowsers['anyCustomNameOfBrowserDisplayedInReports'] = a;
global.screenshotBrowsers.userB = b;
```

if you close the browser, remove it also from global.screenshotBrowsers
After closing browser making screenshots wont' work. Make sense, right no browser no screenshot.
```
delete global.screenshotBrowsers.userB;
```

to reset screenshotBrowsers from your previous spec use this code

```
  beforeAll(function() {
    global.screenshotBrowsers = {};
  });
```

Note: failTestOnErrorLog feature is not implemented to support multiple browsers

Add this plugin to the protractor config file:
```js
exports.config = {
       plugins: [{
       package: 'jasmine2-protractor-utils',
       screenshotOnExpect: {String}    (Default - 'failure+success', 'failure', 'none'),
       screenshotOnSpec: {String}    (Default - 'failure+success', 'failure', 'none'),
       htmlReport: {Boolean}      (Default - true),
       screenshotPath: {String}                (Default - 'reports/screenshots')
       clearFoldersBeforeTest: {Boolean}       (Default - false),
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
        screenshotPath:'./REPORTS/e2e',
        screenshotOnExpect: 'failure+success',
        screenshotOnSpec: 'failure',
        clearFoldersBeforeTest: true,
      }]
    };
```

## package

 This is the plugin package name , same as of npm module name for the plugin , 'jasmine2-protractor-utils' usually and preferably


## htmlReport

 If set to 'false', disables HTML report generation.

 *NOTE: This tool doesn't really make sense to use without the reports.*

 Default: 'true'
 Valid Options: true/false


## screenshotOnExpect

 Takes from each browser instance stored in global.screenshotBrowsers screenshots for each Jasmine2 expect failure or success,  depending on value.

 Default: 'failure+success'
 Valid Options: 'failure+success'/'failure'/'none'


## screenshotOnSpec

Takes from each browser instance stored in global.screenshotBrowsers screenshots for each Jasmine2 spec failure or success,  depending on value.

Default: 'failure'
Valid Options: 'failure+success'/'failure'/'none'


## screenshotPath

 Path where screenshots will be saved. If path does not exist , will be created.
 e.g './reports/something/savehere/' , please take care of './' and '/' at the beginning and end.

 Default: 'reports/screenshots'

## clearFoldersBeforeTest

 If this flag set to true, screenshot and html report directories will be emptied before generating new reports and screenshots

 Default: false

## failTestOnErrorLog (Chrome only, single browser usage only)

Contains a set of configuration for console log. When browser console has errors of a certain log level (default:>900), the spec/test is marked failed along with log in the error report/stacktrace.

### failTestOnErrorLogLevel

Log level, test fails of the browser console log has logs **more than** this specified level.

Default: 900

### excludeKeywords

An array of keywords to be excluded , while searching for error logs. i.e If a log contains any of these keywords , spec/test will not be marked failed.

Please do not specify this flag , if you don't supply any such keywords.


## TODO

It can output browser console logs on failure(done) or always(TODO) :)
