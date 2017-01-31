# jenkins-mocha

Single command to run your Mocha unit tests with both XUnit and LCov output (for Jenkins).

[![Version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][status-image]][status-url] [![Open Issues][issues-image]][issues-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage][cov-image]][cov-url] [![Vulnerabilities][vul-image]][vul-url] ![License][license-image]

## Installation

jenkins-mocha should be added to your test codebase as a dev dependency.  You can do this with:

``` shell
$ npm install --save-dev jenkins-mocha
```

Alternatively you can manually add it to your package.json file:

``` json
{
  "devDependencies" : {
    "jenkins-mocha": "latest"
  }
}
```

then install with:

``` shell
$ npm install --dev
```

## Run

jenkins-mocha should replace your mocha command in npm test

``` json
{
    "scripts": {
        "test": "jenkins-mocha test/*"
    }
}
```

With coverage on (the default), you can pass a `--cobertura` option to the command
to have nyc use the cobertura reporter

```json
{
    "scripts": {
        "devtest": "jenkins-mocha --cobertura test/*"
    }
}
```

If you want to turn coverage reporting off entirely, and just run unit tests with mocha,
you need to pass a `--no-coverage` option to the command

```json
{
    "scripts": {
        "devtest": "jenkins-mocha --no-coverage test/*"
    }
}
```

Any other parameters added to the command will be passed directly to mocha.

If you need to configure nyc, you may create a .nycrc configuration file. Run `nyc help config` for details.

If you want to configure how node is invoked (if you have a giant coverage file), you can set v8 arguments via `$(NODE_ARGS)`.

``` json
{
    "scripts": {
        "test": "NODE_ARGS='--max_old_space_size=4096' jenkins-mocha test/*"
    }
}
```

When npm-test is invoked, the module will:
 - Create XUnit test results in `$(TEST_DIR)`
 - Create LCov coverage in `$(COVERAGE_DIR)` with a HTML report at `$(COVERAGE_DIR)\lcov-report`

Default values are:
 - `$(ARTIFACTS_DIR) = ./artifacts`
 - `$(TEST_DIR) = ./$(ARTIFACTS_DIR)/test`
 - `$(COVERAGE_DIR) = ./$(ARTIFACTS_DIR)/coverage`

## License

[MIT](http://opensource.org/licenses/MIT) © [St. John Johnson](http://stjohnjohnson.com)

[downloads-image]: https://img.shields.io/npm/dm/jenkins-mocha.svg
[license-image]: https://img.shields.io/npm/l/jenkins-mocha.svg
[npm-image]: https://img.shields.io/npm/v/jenkins-mocha.svg
[npm-url]: https://npmjs.org/package/jenkins-mocha
[cov-image]: https://coveralls.io/repos/github/stjohnjohnson/jenkins-mocha/badge.svg?branch=master
[cov-url]: https://coveralls.io/github/stjohnjohnson/jenkins-mocha?branch=master
[status-image]: https://cd.screwdriver.cd/pipelines/63/badge
[status-url]: https://cd.screwdriver.cd/pipelines/63
[vul-image]: https://snyk.io/test/github/stjohnjohnson/jenkins-mocha.git/badge.svg
[vul-url]: https://snyk.io/test/github/stjohnjohnson/jenkins-mocha.git
[issues-image]: https://img.shields.io/github/issues/stjohnjohnson/jenkins-mocha.svg
[issues-url]: https://github.com/stjohnjohnson/jenkins-mocha/issues
[daviddm-image]: https://david-dm.org/stjohnjohnson/jenkins-mocha.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/stjohnjohnson/jenkins-mocha
