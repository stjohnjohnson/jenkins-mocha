'use strict';

/*global __dirname, process, require, describe, it, beforeEach, afterEach */
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
    },
    node_modules = path.join(__dirname, '..', 'node_modules'),
    istanbulPath = path.join(node_modules, '.bin', 'istanbul'),
    specXunitPath = require.resolve('spec-xunit-file'),
    mochaPath = path.join(node_modules, '.bin', 'mocha'),
    _mochaPath = path.join(node_modules, '.bin', '_mocha');

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
                istanbulPath + ' cover --dir ' +
                path.join(process.cwd(), 'artifacts', 'coverage') +
                ' -- ' + _mochaPath + ' --reporter ' + specXunitPath + ' --colors --foo tests/*'
            ], 'mocha was called correctly');
        });

        it('should support a --no-colors options', function () {
            mocks.exec.returns({
                code: 0
            });

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*', '--no-colors']);

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
                istanbulPath + ' cover --dir ' +
                path.join(process.cwd(), 'artifacts', 'coverage') +
                ' -- ' + _mochaPath + ' --reporter ' + specXunitPath + ' --foo tests/* --no-colors'
            ], 'mocha was called correctly');
        });

        it('should support a --no-coverage option', function () {
            mocks.exec.returns({
                code: 0
            });

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*', '--no-coverage']);

            // Check mkdirs
            A.equalObject(mocks.mkdir.args[0], ['-p', path.join(process.cwd(), 'artifacts')], 'artifact dir was created');
            A.equalObject(mocks.mkdir.args[1], ['-p', path.join(process.cwd(), 'artifacts', 'coverage')], 'coverage dir was not created');
            A.equalObject(mocks.mkdir.args[2], ['-p', path.join(process.cwd(), 'artifacts', 'test')], 'tests dir was created');

            // Check environment
            A.equalObject(mocks.env, {
                XUNIT_FILE: path.join(process.cwd(), 'artifacts', 'test', 'xunit.xml')
            }, 'xunit file was set');

            // Check exec
            A.equalObject(mocks.exec.args[0], [
                mochaPath + ' --reporter ' + specXunitPath + ' --colors --foo tests/*'
            ], 'mocha was called correctly');
        });

        it('should support a --cobertura option', function () {
            mocks.exec.returns({
                code: 0
            });

            // Run
            require('../lib/jenkins')(['--foo', 'tests/*', '--cobertura']);

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
                istanbulPath + ' --report cobertura cover --dir ' +
                path.join(process.cwd(), 'artifacts', 'coverage') +
                ' -- ' + _mochaPath + ' --reporter ' + specXunitPath + ' --colors --foo tests/*'
            ], 'mocha was called correctly');
        });
    });
});
