/*global describe, it, beforeEach, afterEach */
var A = require('chai').assert,
    mockery = require('mockery'),
    sinon = require('sinon'),
    path = require('path'),
    mocks = {
        mkdir: sinon.stub(),
        exec: sinon.stub(),
        exit: sinon.stub(),
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
            var baseDir = path.join(__dirname, '..', 'node_modules', '.bin');

            mocks.exec.returns({
                code: 0
            });

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*']);

            // Check mkdirs
            A.equalObject(mocks.mkdir.args[0], ['-p', path.join(process.cwd(), 'artifacts')], 'artifact dir was created');
            A.equalObject(mocks.mkdir.args[1], ['-p', path.join(process.cwd(), 'artifacts', 'coverage')], 'coverage dir was created');
            A.equalObject(mocks.mkdir.args[2], ['-p', path.join(process.cwd(), 'artifacts', 'test')], 'tests dir was created');

            // Check environment
            A.equalObject(mocks.env, {
                XUNIT_FILE: path.join(process.cwd(), 'artifacts', 'test', 'xunit.xml')
            }, 'xunit file was set');

            // Check exec
            A.equalObject(mocks.exec.args[0], [
                path.join(baseDir, 'istanbul') + ' cover --dir ' +
                path.join(process.cwd(), 'artifacts', 'coverage') +
                ' -- ' + path.join(baseDir, '_mocha') + ' --reporter spec-xunit-file --foo tests/*'
            ], 'mocha was called correctly');
        });
    });
});
