/*global describe, it, beforeEach, afterEach */
var A = require('chai').assert,
    mockery = require('mockery'),
    sinon = require('sinon'),
    path = require('path'),
    mocks = {
        mkdir: sinon.stub(),
        exec: sinon.stub(),
        config: {},
        env: {}
    };

A.equalObject = function (a, b, message) {
    A.equal(JSON.stringify(a, null, 4), JSON.stringify(b, null, 4), message);
};

describe('Jenkins Mocha Test Case', function () {
    beforeEach(function () {
        Object.keys(mocks).forEach(function (key) {
            if (typeof mocks[key] === 'function') {
                mocks[key] = sinon.stub();
            } else {
                mocks[key] = {};
            }
        });

        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });
        mockery.registerMock('shelljs', mocks);
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('jenkins', function () {
        it('should run the right functions', function () {
            // Run
            require('../bin/jenkins');

            // Check mkdirs
            A.equalObject(mocks.mkdir.args[0], ['-p', path.join(process.cwd(), 'artifacts')], 'artifact dir was created');
            A.equalObject(mocks.mkdir.args[1], ['-p', path.join(process.cwd(), 'artifacts', 'coverage')], 'coverage dir was created');
            A.equalObject(mocks.mkdir.args[2], ['-p', path.join(process.cwd(), 'artifacts', 'tests')], 'tests dir was created');

            // Check environment
            A.equalObject(mocks.env, {
                XUNIT_FILE: path.join(process.cwd(), 'artifacts', 'tests', 'xunit.xml')
            }, 'xunit file was set');

            // Check exec
            A.equalObject(mocks.exec.args[0], [
                path.join(__dirname, '..', 'node_modules', '.bin', 'istanbul') +
                ' cover --dir ' +
                path.join(process.cwd(), 'artifacts', 'coverage') +
                ' -- ' + path.join(__dirname, '..', 'node_modules', '.bin', '_mocha') +
                ' --reporter spec-xunit-file'
            ], 'mocha was called correctly');
        });
    });
});
