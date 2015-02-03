var shell = require('shelljs'),
    path = require('path'),
    directories = {};

shell.config.fatal = true;

module.exports = function (args) {
    directories.artifacts = shell.env.ARTIFACTS_DIR || path.join(process.cwd(), 'artifacts');
    directories.coverage = shell.env.COVERAGE_DIR || path.join(directories.artifacts, 'coverage');
    directories.tests = shell.env.TEST_DIR || path.join(directories.artifacts, 'test');
    directories.base = path.join(__dirname, '..', 'node_modules', '.bin');

    // Make sure directories exist
    Object.keys(directories).forEach(function (name) {
        shell.mkdir('-p', directories[name]);
    });

    // Set Xunit file
    shell.env.XUNIT_FILE = path.join(directories.tests, 'xunit.xml');

    if (args.indexOf('--no-colors') === -1) {
        args.unshift('--colors');
    }

    // Trigger istanbul
    shell.exit(shell.exec(
        path.join(directories.base, 'istanbul') +
        ' cover --dir ' + directories.coverage + ' -- ' +
        path.join(directories.base, '_mocha') +
        ' --reporter spec-xunit-file ' + args.join(' ')
    ).code);
};
