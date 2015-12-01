# jasmine2-protractor-utils
Utilities for Protractor with jasmine2 [Screenshot, Browser Console log]

1. This plugin can take a screenshot for each Jasmine2 expect failure
2. It can take screenshot for each spec failure as well
3. TODO: It can fail your spec/test if browser console has errors
4. TODO: It can output browser console logs on failure or always :)

# Usage

## How to install

npm install jasmine2-protractor-utils -g

*To install a particular version:* npm install jasmine2-protractor-utils@version


Add this plugin to the protractor config file:
```js
exports.config = {
      plugins: [{
        package: 'jasmine2-protractor-utils',
        screenshotOnExpectFailure: {Boolean}    (Default - false),
        screenshotOnSpecFailure: {Boolean}      (Default - false),
        screenshotPath: {String}                (Default - 'reports/screenshots')
      }]
    };
```

Example:

```js
exports.config = {
      plugins: [{
        package: 'jasmine2-protractor-utils',
        screenshotOnExpectFailure:true,
        screenshotOnSpecFailure:true
      }]
    };
```

## package

 This is the plugin package name , same as of npm module name for the plugin , 'jasmine2-protractor-utils' usually and preferably


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


## TODO
It can fail your spec/test if browser console has errors.

It can output browser console logs on failure or always :)