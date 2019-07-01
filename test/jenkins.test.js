'use strict';

/*global __dirname, process, require, describe, it, beforeEach, afterEach */
var A = require('chai').assert,
    mockery = require('mockery'),
    sinon = require('sinon'),
    path = require('path'),
    shellescape = require('shell-escape'),
    mocks = {
        mkdir: sinon.stub(),
        exec: sinon.stub(),
        exit: sinon.stub(),
        config: {},
        env: {}
    },
    node_modules = path.join(__dirname, '..', 'node_modules'),
    nycPath = escape(path.join(node_modules, '.bin', 'nyc')),
    specXunitPath = escape(require.resolve('spec-xunit-file')),
    mochaPath = escape(path.join(node_modules, '.bin', 'mocha')),
    _mochaPath = escape(path.join(node_modules, '.bin', '_mocha')),
    coverage = escape(path.join(process.cwd(), 'artifacts', 'coverage'));


A.equalObject = function (a, b, message) {
    A.equal(JSON.stringify(a, null, 4), JSON.stringify(b, null, 4), message);
};

function escape(directory){
    return shellescape([directory]);
}

describe('Jenkins Mocha Test Case', function () {
    // Bump timeout to 5 seconds
    this.timeout(5000);

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

    function assertMkDirCallsAreReceived(){
        // Check mkdirs
        A.equalObject(mocks.mkdir.args[0], ['-p', path.join(process.cwd(), 'artifacts')], 'artifact dir was created');
        A.equalObject(mocks.mkdir.args[1], ['-p', path.join(process.cwd(), 'artifacts', 'coverage')], 'coverage dir was created');
        A.equalObject(mocks.mkdir.args[2], ['-p', path.join(process.cwd(), 'artifacts', 'test')], 'tests dir was created');
    }

    describe('jenkins', function () {
        it('should run the right functions', function () {
            mocks.exec.returns({
                code: 0
            });

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*']);

            assertMkDirCallsAreReceived();

            // Check environment
            A.equalObject(mocks.env, {
                XUNIT_FILE: path.join(process.cwd(), 'artifacts', 'test', 'xunit.xml')
            }, 'xunit file was set');

            // Check exec
            A.equalObject(mocks.exec.args[0], [
                'node  ' + nycPath + ' --reporter lcov --reporter text-summary --cache=false --report-dir ' +
                coverage +
                ' -- node  ' + _mochaPath + ' --reporter ' + specXunitPath + ' --colors --foo \'tests/*\''
            ], 'mocha was called correctly');
        });

        it('should support a --no-colors options', function () {
            mocks.exec.returns({
                code: 0
            });

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*', '--no-colors']);

            assertMkDirCallsAreReceived();

            // Check environment
            A.equalObject(mocks.env, {
                XUNIT_FILE: path.join(process.cwd(), 'artifacts', 'test', 'xunit.xml')
            }, 'xunit file was set');

            // Check exec
            A.equalObject(mocks.exec.args[0], [
                'node  ' + nycPath + ' --reporter lcov --reporter text-summary --cache=false --report-dir ' +
                coverage +
                ' -- node  ' + _mochaPath + ' --reporter ' + specXunitPath + ' --foo \'tests/*\' --no-colors'
            ], 'mocha was called correctly');
        });

        it('should support a --no-coverage option', function () {
            mocks.exec.returns({
                code: 0
            });

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*', '--no-coverage']);

            assertMkDirCallsAreReceived();

            // Check environment
            A.equalObject(mocks.env, {
                XUNIT_FILE: path.join(process.cwd(), 'artifacts', 'test', 'xunit.xml')
            }, 'xunit file was set');

            // Check exec
            A.equalObject(mocks.exec.args[0], [
                'node  ' + mochaPath + ' --reporter ' + specXunitPath + ' --colors --foo \'tests/*\''
            ], 'mocha was called correctly');
        });

        it('should support a --cobertura option', function () {
            mocks.exec.returns({
                code: 0
            });

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*', '--cobertura']);

            assertMkDirCallsAreReceived();

            // Check environment
            A.equalObject(mocks.env, {
                XUNIT_FILE: path.join(process.cwd(), 'artifacts', 'test', 'xunit.xml')
            }, 'xunit file was set');

            // Check exec
            A.equalObject(mocks.exec.args[0], [
                'node  ' + nycPath + ' --reporter cobertura --cache=false --report-dir ' +
                coverage +
                ' -- node  ' + _mochaPath + ' --reporter ' + specXunitPath + ' --colors --foo \'tests/*\''
            ], 'mocha was called correctly');
        });

        it('should support passing Node args', function () {
            mocks.exec.returns({
                code: 0
            });
            mocks.env.NODE_ARGS = '--flop=blop';

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*', '--no-colors']);

            assertMkDirCallsAreReceived();

            // Check environment
            A.equalObject(mocks.env, {
                NODE_ARGS: '--flop=blop',
                XUNIT_FILE: path.join(process.cwd(), 'artifacts', 'test', 'xunit.xml')
            }, 'xunit file was set');

            // Check exec
            A.equalObject(mocks.exec.args[0], [
                'node --flop=blop ' + nycPath + ' --reporter lcov --reporter text-summary --cache=false --report-dir ' +
                coverage +
                ' -- node --flop=blop ' + _mochaPath + ' --reporter ' + specXunitPath + ' --foo \'tests/*\' --no-colors'
            ], 'mocha was called correctly');
        });
    });
});
