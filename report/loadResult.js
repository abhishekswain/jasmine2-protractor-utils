var loadContent = function () {

    try {

        var resultString = JSON.stringify(data);
        resultJSON = JSON.parse(resultString);

        var getTimeDiff = function (start, end) {

            var date1 = new Date(start);
            var date2 = new Date(end);

            var diff = date2.getTime() - date1.getTime();

            var msec = diff;
            var hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            var mm = Math.floor(msec / 1000 / 60);
            msec -= mm * 1000 * 60;
            var ss = Math.floor(msec / 1000);
            msec -= ss * 1000;

            if (hh !== 0)
                return(hh + " hours " + mm + " mins " + ss + " secs");
            else if (hh === 0 && mm !== 0)
                return(mm + " mins " + ss + " secs");
            else
                return(ss + " secs");
        };


        var headerTemplate = '<thead>\n <tr>\n <th>Description</th>\n <th>Status</th>\n <th>Time</th>\n <th>Total Specs</th>\n <th>Failed</th>\n <th>Passed</th>\n </tr>\n </thead>';
        var suiteTemplate = '<tbody onclick="activateToggle(this);" tid="suiteID" class="labels">\n<tr>\n <td colspan="1">\n <label tid="suiteID"  >suiteName</label> \n </td>\n <td colspan="1">\n<label>suiteStatus</label>\n</td>\n <td colspan="1">\n<label>suiteDuration</label>\n</td>\n <td colspan="1">\n<label>suiteTotal</label>\n</td>\n <td colspan="1">\n <label>suiteFailedSpecs</label>\n </td>\n <td colspan="1">\n <label>suitePassedSpecs</label>\n</td>\n </tr>\n<tr class="hide" style="display:none;"   tid="suiteID" >\n <td colspan="1">\n<label>Spec</label>\n</td>\n<td colspan="1">\n<label>Status</label>\n</td>\n<td colspan="1">\n<label>Passed Assertions</label>\n</td>\n<td colspan="1">\n<label>Failed Assertions</label>\n</td>\n<td colspan="1">\n<label>Duration</label>\n</td>\n<td colspan="1">\n<label>Screenshots</label>\n</td>\n</tr>\n</tbody>'

        var specTemplate0 = '<tbody class="hide" style="display:none;"   tid="suiteID"  tid="suiteID">\n <tr>\n <td>specName</td>\n <td>\n <div>specStatus</div>\n </td>';
        var passedSpecsTemplate = '<td>\n<div>passedExpectationNumber</div>\n</td>';
        var failedSpecsTemplate = '<td>\n <div>failedSpecsList</div>\n </td>';
        var specTemplateLast = '<td>specTime</td>\n <td>Please check screenshots folder!</td>\n </tr>\n </tbody>';

        var all = '';
        var specAll = '';

        resultJSON.suites.forEach(function (suite, index) {

            var tempsuiteTemplate = suiteTemplate.replace('suiteName', suite.fullName).replace('suiteStatus', suite.testStatus).replace('suiteDuration', getTimeDiff(suite.startTime, suite.endTime)).replace('suiteTotal', suite.specs.length).replace('suiteFailedSpecs', JSON.stringify(suite.specs).split('"status":"failed"').length - 1).replace('suitePassedSpecs', JSON.stringify(suite.specs).split('"status":"passed"').length - 1);

            if (suite.testStatus === 'Fail') {
                tempsuiteTemplate = tempsuiteTemplate.replace('labels', 'labelsFail');
            }
            var tempspecAll = '';
            suite.specs.forEach(function (spec, specindex) {
                specTemplate0 = '<tbody class="hide" style="display:none;"   tid="suiteID"  tid="suiteID">\n <tr>\n <td>specName</td>\n <td>\n <div>specStatus</div>\n </td>';
                specTemplate0 = specTemplate0.replace('specName', spec.description).replace('specStatus', spec.status);
                passedSpecsTemplate = '<td>\n<div>passedExpectationNumber</div>\n</td>';
                passedSpecsTemplate = passedSpecsTemplate.replace('passedExpectationNumber', spec.passedExpectations.length);
                var failedExpectAll = '';


                spec.failedExpectations.forEach(function (expect, expectindex) {
                    var tempFailed = '<div><b><i style="color: red">Serial: </i></b>' + (expectindex + 1) + '</div>' + '<div><b><i style="color: red">Message:</i></b> ' + expect.message + '</div>' + '<div><b><i style="color: red">StackTrace:</i></b> ' + expect.stack + '</div><br>';
                    failedExpectAll = failedExpectAll + tempFailed;
                });

                failedSpecsTemplate = '<td>\n <div>failedSpecsList</div>\n </td>';

                if (spec.failedExpectations.length === 0) {
                    failedSpecsTemplate = failedSpecsTemplate.replace('failedSpecsList', 0);
                } else {
                    failedSpecsTemplate = failedSpecsTemplate.replace('failedSpecsList', failedExpectAll);
                }

                var screenshotTemplate=" ";
                spec.screenShots.forEach(function (screens, scIndex) {

                    if (scIndex === 0) {
                        screenshotTemplate = '\n <p><a class="group-'+index+ '-' + specindex +'"'+'href="screenshots/' + screens + '" title="' + screens + '">Click Here</a></p>';
                    }
                    else {

                        screenshotTemplate += '\n <p style="display:none"><a class="group-'+index+ '-' + specindex +'"'+ 'href="screenshots/' + screens + '" title="' + screens + '">Photo 2</a></p>';

                    }
                });

                screenshotTemplate = '<div>' + screenshotTemplate + '</div>';


                specTemplateLast = '<td>specTime</td>\n <td>' + screenshotTemplate + '</td>\n </tr>\n </tbody>';
                specTemplateLast = specTemplateLast.replace('specTime', getTimeDiff(spec.startTime, spec.endTime));

                tempspecAll = tempspecAll + specTemplate0 + passedSpecsTemplate + failedSpecsTemplate + specTemplateLast;

            });
            all = all + tempsuiteTemplate + tempspecAll;
            all = all.split('"suiteID"').join(index);
        });


        document.getElementById('1').innerHTML = headerTemplate + all;
    } catch (err) {
        console.log('Error While Loading Contents!!' + err);
        alert('Error While Loading Contents!! : ' + err);
    }
};


