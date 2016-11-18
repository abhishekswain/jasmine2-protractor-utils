# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.2.3"></a>
## [0.2.3](https://github.com/azachar/protractor-screenshoter-plugin/compare/v0.2.2...v0.2.3) (2016-11-18)


### Bug Fixes

* **plugin:** author's info ([ab2b8d3](https://github.com/azachar/protractor-screenshoter-plugin/commit/ab2b8d3))
* **plugin:** clean up folders ([c358ec1](https://github.com/azachar/protractor-screenshoter-plugin/commit/c358ec1))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/azachar/protractor-screenshoter-plugin/compare/v0.2.1...v0.2.2) (2016-11-05)


### Bug Fixes

* **docs:** writeReportFreq instead of htmlWriteFreq ([1b72e6a](https://github.com/azachar/protractor-screenshoter-plugin/commit/1b72e6a))
* race conditions ([c277e24](https://github.com/azachar/protractor-screenshoter-plugin/commit/c277e24)), closes [#4](https://github.com/azachar/protractor-screenshoter-plugin/issues/4)
* **onSpecDone:** async storing of screenshots references into the report ([a0e051c](https://github.com/azachar/protractor-screenshoter-plugin/commit/a0e051c))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/azachar/protractor-screenshoter-plugin/compare/v0.2.0...v0.2.1) (2016-10-19)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/azachar/protractor-screenshoter-plugin/compare/v0.1.1...v0.2.0) (2016-10-15)


### Features

* circleci.com environmental variables support ([0b358c5](https://github.com/azachar/protractor-screenshoter-plugin/commit/0b358c5))



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
