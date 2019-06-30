'use strict';

/*global __dirname, process, require, module */
var shell = require('shelljs'),
    shellescape = require('shell-escape'),
    path = require('path'),
    whichLocal = require('npm-which')(path.resolve(__dirname, '..')),
    whichCwd = require('npm-which')(process.cwd()),
    directories = {};

shell.config.fatal = false;

/**
 * Get the file location of this node_module binary
 * @method getBin
 * @param  {string} filename Bin you are looking for
 * @return {string}          Full path to the file
 */
function getBin(filename) {
    try {
        return escape(whichLocal.sync(filename));
    } catch (unused) {
        return escape(whichCwd.sync(filename));
    }
}

/**
 * Escapes directory path, single argument version for 'shell-escape'.
 * @method escape
 * @param  {string} directory Directory you wish to escape
 * @return {string}          Escaped directory
 */
function escape(directory){
    return shellescape([directory]);
}

/**
 * Executes istanbul and mocha and sends all the output to the right location
 * @param  {Object} args Mocha arguments
 */
module.exports = function (args) {
    directories.artifacts = shell.env.ARTIFACTS_DIR || path.join(process.cwd(), 'artifacts');
    directories.coverage = shell.env.COVERAGE_DIR || path.join(directories.artifacts, 'coverage');
    directories.tests = shell.env.TEST_DIR || path.join(directories.artifacts, 'test');

    // Make sure directories exist
    Object.keys(directories).forEach(function (name) {
        shell.mkdir('-p', directories[name]);
    });

    // Set Xunit file
    shell.env.XUNIT_FILE = path.join(directories.tests, 'xunit.xml');

    if (args.indexOf('--no-colors') === -1) {
        args.unshift('--colors');
    }

    var command = [];
    var nodeArgs = shell.env.NODE_ARGS || '';

    var noCoverageIndex = args.indexOf('--no-coverage');
    if (noCoverageIndex === -1) {
        // we want coverage
        command.push('node', nodeArgs, getBin('nyc'));

        // .. but do we want cobertura?
        var coberturaIndex = args.indexOf('--cobertura');
        if (coberturaIndex !== -1) {
            // remove the --cobertura option from args array
            args.splice(coberturaIndex, 1);
            command.push('--reporter cobertura');
        } else {
            command.push('--reporter lcov --reporter text-summary');
        }

        command.push('--cache=false');
        command.push('--report-dir ' + escape(directories.coverage) + ' --');
        command.push('node', nodeArgs, getBin('_mocha'));
    } else {
        // remove the --no-coverage option from args array
        args.splice(noCoverageIndex, 1);
        command.push('node', nodeArgs, getBin('mocha'));
    }

    command.push('--reporter ' + escape(require.resolve('spec-xunit-file')));
    command.push(shellescape(args));

    // Trigger istanbul and mocha
    shell.exit(shell.exec(command.join(' ')).code);
};
