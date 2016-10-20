var env = require('./environment');
var path = require('path');

var fs = require('fs-extra');
var cp = require('child_process')

function runProtractorWithConfig(configName) {
    var command = 'protractor ./spec/integrational/protractor-config/' + configName;
    console.info('Running command ' + command);
    try {
        cp.execSync(command, {
            // stdio: [0, 1, 2] //for full debug
            stdio: [2]
        });
    } catch (er) {
        console.debug(er.stack);
        if (er.pid) {
            console.log('%s (pid: %d) exited with status %d',
                er.file, er.pid, er.status);
        }
    }
    console.info('Done with command ' + command);
}

describe("Screenshoter running under protractor", function() {

    var originalTimeout;
    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    describe("out of box configuration", function() {

        beforeEach(function() {
            runProtractorWithConfig('default.js');
        });

        it("should generate report.js", function(done) {
            fs.readFile('./reports/e2e/report.js', 'utf8', function(err, data) {
                if (err) {
                    return done.fail(err);
                }
                expect(data).toContain('angular');
                expect(data).toContain('report');
                expect(data).toContain('tests');
                expect(data).toContain('passed');
                done();

            });
        });

        it("should install reporter", function(done) {
            fs.readFile('./reports/e2e/index.html', 'utf8', function(err, data) {
                if (err) {
                    return done.fail(err);
                }
                expect(data).toContain('ui-view');
                expect(data).toContain('html');
                done();
            });
        });

    });

    describe("suggested configuration", function() {

        beforeEach(function() {
            runProtractorWithConfig('readme.js');
        });

        it("should generate report.js", function(done) {
            fs.readFile('./tmp/REPORTS/e2e/report.js', 'utf8', function(err, data) {
                if (err) {
                    return done.fail(err);
                }
                expect(data).toContain('angular');
                expect(data).toContain('report');
                expect(data).toContain('tests');
                expect(data).toContain('passed');
                done();

            });
        });

        it("should install reporter", function(done) {
            fs.readFile('./tmp/REPORTS/e2e/index.html', 'utf8', function(err, data) {
                if (err) {
                    return done.fail(err);
                }
                expect(data).toContain('ui-view');
                expect(data).toContain('html');
                done();
            });
        });
    });
});
