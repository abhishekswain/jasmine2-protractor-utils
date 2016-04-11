/**
 * Created by Abhishek Swain on 15/02/16.
 * @Description A custom reporter for Jasmine2, generate json report file
 */

'use strict';

var fs = require('fs');
var fse = require('fs-extra');

var Jasmine2Reporter = function (htmlReportPath,screenshotPath) {

    var htmlReportDir = htmlReportPath;

    var self = this;
    var results = {};
    var suites = [];
    var specs = [];
    var suiteTimes = [];

    self.jasmineStarted = function (suiteInfo) {

        results.startTime = new Date();
        results.noOfSpecs = suiteInfo.totalSpecsDefined;
    };

    self.suiteStarted = function (suite) {

        var time = new Date();

        suites.push(suite);

        suiteTimes.push({'id': suite.id, 'startTime': time});

    };

    self.suiteDone = function (result) {

        var time = new Date();

        suiteTimes.forEach(function (suiteTime, index) {
            if (suiteTime.id === result.id) {
                suiteTimes[index].endTime = time;
            }
        });
    };

    self.specStarted = function (spec) {

        var specDetails = spec;
        specDetails.startTime = new Date();

        if (specs.length === 0) {
            specs.push(specDetails);
        }
        else {
            if (specs.indexOf(spec) === -1) {
                specs.push(specDetails);
            }
        }
    };

    self.specDone = function (result) {

        specs.forEach(function (spec, index) {

            if (spec.id === result.id) {
                specs[index].endTime = new Date();
            }
        });

    };

    self.jasmineDone = function () {

        results.endTime = new Date();

        suites.forEach(function (suite, index) {

            specs.forEach(function (spec, specIndex) {


                if (suite.fullName.trim() === spec.fullName.replace(spec.description, '').trim()) {

                    if (suites[index].specs) {
                        suites[index].specs.push(spec);
                    }
                    else {
                        suites[index].specs = [];
                        suites[index].specs.push(spec);
                    }
                }

            });

            suiteTimes.forEach(function (suiteTime, timeIndex) {

                if (suiteTime.id === suite.id) {
                    suites[index].startTime = suiteTime.startTime;
                    suites[index].endTime = suiteTime.endTime;
                }

            });

        });


        suites.forEach(function (suite, index) {

            var flag = true;

            suite.specs.forEach(function(spec,specIndex){

                if(spec.failedExpectations.length > 0){

                    suites[index].testStatus = "Fail";
                    flag = false;
                }

            });

            if(flag){
                suites[index].testStatus = "Pass";
            }

        });

        results.suites = suites;
        var resultToWrite = 'data = '+ JSON.stringify(results);

        fs.writeFileSync(htmlReportDir+'/data.json', resultToWrite, 'utf-8');
        fse.copySync(__dirname+'/../report',htmlReportDir);

        try {
            fse.copySync(__dirname+'/../report',htmlReportDir);
        } catch (err) {
            console.error(err)
        }

    }
};

module.exports = Jasmine2Reporter;