var shell = require('shelljs'),
    path = require('path'),
    directories = {};

module.exports = function (args) {
    directories.artifacts = shell.env.ARTIFACTS_DIR || path.join(process.cwd(), 'artifacts');
    directories.coverage = path.join(directories.artifacts, 'coverage');
    directories.tests = path.join(directories.artifacts, 'tests');

    shell.config.fatal = true;

    // Make sure directories exist
    Object.keys(directories).forEach(function (name) {
        shell.mkdir('-p', directories[name]);
    });

    // Set Xunit file
    shell.env.XUNIT_FILE = path.join(directories.tests, 'xunit.xml');

    // Trigger istanbul
    shell.exec('istanbul cover --dir ' + directories.coverage + ' -- _mocha --reporter spec-xunit-file ' + args.join(' '));
}
