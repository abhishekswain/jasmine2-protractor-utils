[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/protractor-screenshoter-plugin/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm](https://img.shields.io/npm/dm/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin)
[![npm](https://img.shields.io/npm/dt/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin)

[![npm](https://img.shields.io/npm/v/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin)
[![npm](https://img.shields.io/npm/l/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin)
[![Semver](http://img.shields.io/SemVer/2.0.0.png)](http://semver.org/spec/v2.0.0.html)

[![Dependency Status](https://david-dm.org/azachar/protractor-screenshoter-plugin.svg)](https://david-dm.org/azachar/protractor-screenshoter-plugin)
[![devDependency Status](https://david-dm.org/azachar/protractor-screenshoter-plugin/dev-status.svg)](https://david-dm.org/azachar/protractor-screenshoter-plugin#info=devDependencies)

# protractor-screenshoter-plugin
This plugin captures for each **expectation** or **spec** console **logs** and makes **screenshots** for **each browser** instance. Also it comes with a beautifull angular based  [HTML reporter for chat alike apps](https://github.com/azachar/screenshoter-report-analyzer).

1. This plugin can take screenshots for each Jasmine2 expect success/failure on *multiple-browsers instances* at once.
2. It can take screenshots for each spec failure / success as well
3. For each expectation or spec can capture console logs for each browser instance
4. It can generate a report analyzer - angular+bootstrap HTML reports with active filtering to easy find out why your tests are failing
5. HTML reports allow you to analyze your browser's console logs as well.
6. Support circleci.com (the report displays a build number, a branch, etc. )

## Motivation
The main motivation to make this fork from https://github.com/abhishekswain/jasmine2-protractor-utils was taking screenshots from multiple browsers at once. So it would allow me to test a chat alike  apps where  2+ browsers instances are required to be run from one single test.

Later on, I realized that I want to have a quick overview what is happening with my tests on the CI server. Without even re-running them locally. When something goes wrong you are basically unable to discover it. This plugin allows you to do so.

The included HTML reporter is angular based standalone app with a beautiful bootstrap theme. It allows filtering and narrows down to the root cause. Each screenshot has attached console logs. And we are making screenshots by every expectation not just when the spec is done (this is usually too late to find out, why your test is failing).

Using this plugin without the HTML report doesn't make sense. The main added value is to have a great analytics tool for your reports that visualize all possible available data to provide holistic approach.

From the code perspective I split up the report code from the protractor plugin. Perhaps you can plugin in your reporter instead.

Also, I created a list of [alternatives](https://github.com/azachar/protractor-screenshoter-plugin/wiki/Alernatives) to this plugin and why I think they are just not good enough.

# How to install

``npm install protractor-screenshoter-plugin@latest``

NOTE: This plugin depends on [screenshoter-report-analyzer](https://github.com/azachar/screenshoter-report-analyzer). So sometimes even if this plugin version is not updated, the reporter might be.

# Usage

Add this plugin to the protractor config file:
```js
exports.config = {
       plugins: [{
       package: 'protractor-screenshoter-plugin',
       screenshotOnExpect: {String}    (Default - 'failure+success', 'failure', 'none'),
       screenshotOnSpec: {String}    (Default - 'failure+success', 'failure', 'none'),
       withLogs: {Boolean}      (Default - true),
       htmlReport: {Boolean}      (Default - true),
       screenshotPath: {String}                (Default - '<reports/e2e>/screenshots')
       writeReportFreq: {String}      (Default - 'end', 'spec', 'asap'),
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
        package: 'protractor-screenshoter-plugin',
        screenshotPath:'./REPORTS/e2e',
        screenshotOnExpect: 'failure+success',
        screenshotOnSpec: 'none',
        withLogs: 'true',
        writeReportFreq: 'asap',
        clearFoldersBeforeTest: true,
      }]
    };
```

## Single browser app
No need to setup anything special to make screenshots or capture console logs.


## Multi-browser chat alike app

In order to use multi-browser chat alike testing, you need to keep a track of all browser instances by yourself:

You can do it like this
```
var a  = browser.forkNewInstance();
var b  = browser.forkNewInstance();

global.screenshotBrowsers['anyCustomNameOfBrowserDisplayedInReports'] = a;
global.screenshotBrowsers.userB = b;
```

if you close the browser, remove it also from global.screenshotBrowsers
After closing browser making screenshots won't work. Make sense, right no browser no screenshot.
```
delete global.screenshotBrowsers.userB;
```

to reset screenshotBrowsers from your previous spec use this code

```
  beforeAll(function() {
    global.screenshotBrowsers = {};
  });
```


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

## withLogs (Chrome only)

 If set to 'true', capture from chrome all logs after each expect or spec

 *NOTE: This works only on chrome!*

 Default: 'true'
 Valid Options: true/false

In order to make chrome' console works properly, you need to modify your ``protractor.conf`` as follows  https://github.com/webdriverio/webdriverio/issues/491#issuecomment-95510796


## writeReportFreq
By default, the output JSON file with tests results is written at the end of the execution of jasmine tests. However for debug process is better to get it immediately after each expectation - specify the option 'asap'. Also, there is a less usual option to write it after each test - use the option 'spec'. The recommended is to left it out for a CI server and for a local debugging use the option 'asap'.

 Default: 'end'
 Valid Options: 'asap', 'spec', 'end'

## screenshotPath

 The path where the final report including screenshots will be saved. If the path does not exist, will be created.
 e.g './reports/something/samewhere/', please take care of './' and '/' at the beginning and end.

 Please note that due to an HTML reporter sugar, the final screenshots are stored in the subfolder relative to this $screenshotPath parameter, e.g. in the folder ``$screenshotPath/screenshots'``

 Default: 'reports/e2e'

## clearFoldersBeforeTest

 If this flag set to true, screenshot and HTML report directories will be emptied before generating new reports and screenshots

 Default: false

## failTestOnErrorLog (Chrome only)

Contains a set of configuration for console log. When browser console has errors of a certain log level (default:>900), the spec/test is marked failed along with log in the error report/stacktrace.

 *NOTE: This works only on chrome!*

### failTestOnErrorLogLevel

Log level, test fails of the browser console log has logs **more than** this specified level.

Default: 900

### excludeKeywords

An array of keywords to be excluded , while searching for error logs. i.e If a log contains any of these keywords , spec/test will not be marked failed.

Please do not specify this flag , if you don't supply any such keywords.


## TODO
*  Convert to typescript based es6 npm plugin with a proper test infrastructure
*  Support Mocha framework
