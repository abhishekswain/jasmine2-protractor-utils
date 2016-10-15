# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.1.1"></a>
## [0.1.1](https://github.com/azachar/protractor-screenshoter-plugin/compare/v0.1.0...v0.1.1) (2016-10-15)


### Bug Fixes

* **refactor:** correct reporter path resolving ([95cc67e](https://github.com/azachar/protractor-screenshoter-plugin/commit/95cc67e))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/azachar/protractor-screenshoter-plugin/compare/1.2.8...v0.1.0) (2016-10-15)


### Features

* captures screenshots and console logs from forked browser instances, from now on forked as protractor-screenshoter-plugin 0.1.0 ([0f69ade](https://github.com/azachar/protractor-screenshoter-plugin/commit/0f69ade))


### BREAKING CHANGES

* s

Added some new config options

*screenshotOnExpect*
*screenshotOnSpec*

Possible values are ``'failure+success', 'failure', 'none'``

* removed options *htmlReportDir*, *screenshotOnExpectFailure*, *screenshotOnSpecFailure*
