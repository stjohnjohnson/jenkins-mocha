# jenkins-mocha

Single command to run your Mocha unit tests with both XUnit and LCov output (for Jenkins).

[![Coverage Status](https://coveralls.io/repos/github/stjohnjohnson/jenkins-mocha/badge.svg?branch=master)](https://coveralls.io/github/stjohnjohnson/jenkins-mocha?branch=master)

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
to have istanbul use the cobertura reporter

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

If you need to configure istanbul, you may create a .istanbul.yml configuration file. Run `istanbul help config` for details.

When npm-test is invoked, the module will:
 - Create XUnit test results in `$(TEST_DIR)`
 - Create LCov coverage in `$(COVERAGE_DIR)` with a HTML report at `$(COVERAGE_DIR)\lcov-report`

Default values are:
 - `$(ARTIFACTS_DIR) = ./artifacts`
 - `$(TEST_DIR) = ./$(ARTIFACTS_DIR)/test`
 - `$(COVERAGE_DIR) = ./$(ARTIFACTS_DIR)/coverage`

## Restrictions

jenkins-mocha *cannot work* if your package brings in spec-xunit-file or mocha and istanbul are included greater than two packages below jenkins-mocha.  This is due to the relative path resolution of mocha/istanbul executables and mocha reporters.

## License

[MIT](http://opensource.org/licenses/MIT) © [St. John Johnson](http://stjohnjohnson.com)
