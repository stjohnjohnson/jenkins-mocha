var shell = require('shelljs'),
    path = require('path'),
    directories = {},
    executables = {
        istanbul: path.join(__dirname, '..', 'node_modules', '.bin', 'istanbul'),
        mocha: path.join(__dirname, '..', 'node_modules', '.bin', '_mocha')
    };

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
shell.exec(executables.istanbul + ' cover --dir ' + directories.coverage + ' -- ' + executables.mocha + ' --reporter spec-xunit-file');
