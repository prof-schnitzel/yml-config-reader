# yml-config-reader - YAML Configuration Reader for Node.js

![Node.js Package](https://github.com/prof-schnitzel/yml-config-reader/workflows/Node.js%20Package/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/prof-schnitzel/yml-config-reader/badge.svg?branch=master)](https://coveralls.io/github/prof-schnitzel/yml-config-reader?branch=master)

This plugin provides a way to configure your node project based on YAML files. The configuration
reader itself is really small since almost everything is done by
[js-yaml](https://github.com/nodeca/js-yaml) or [lodash](https://github.com/lodash/lodash). You can
use it as an alternative to [dotenv](https://github.com/motdotla/dotenv) with the advantage that
you can provide default settings and use the more powerful YAML format.

## Installation

```
$ npm install yml-config-reader --save-dev
```

## Usage

Create a file `config.default.yml` with your configuration. Example:

```yaml
app1:
    serviceUrl: app1.api.com
db:
    name: test-db
stage: qa
```
To read this config file, you need the following javascript code.
```javascript
const configReader = require('yml-config-reader')

const config = configReader.getByFiles('config.default.yml')
console.log(config.db.name) // prints test-db
```
The method `getByFiles` can take an arbitrary number of config files that are merged together with
values in later files taking precedence.
Example: `getByFiles('config.default.yml', 'config.qa.yml')`

As an alternative you can pass an environment variable to your node application which then can be
used to pick up the according config files. Example:
```
$ STAGE=test node yourscript.js
```
```javascript
const configReader = require('yml-config-reader')

const config = configReader.getByEnv(process.env.STAGE)
console.log(config.db.name) // prints test-db
```
The command `getByEnv` takes a parameter `environment` and uses this one to search for the file
`config.${environment}.yml`. This method always checks if a file called `config.default.yml` exists
and uses configuration values that are defined in that file as defaults.

You can also specify a folder name if you wish to store your config files separately. Example:
```javascript
const configReader = require('yml-config-reader')

configReader.getByEnv(process.env.STAGE, 'config') // uses the 'config' folder
configReader.getByFiles('config/config.default.yml', 'config/config.qa.yml')
```

## Compound / Nested Variables

It is possible to reuse existing properties in a config file as values for other properties. You
can use the syntax `${varName}` if you wish that the string `${varName}` shall be substituted with
the actual value of the property `varName`.
Example:
```yaml
baseUrl: app.company.com

app1:
    restUrl: app1.${baseUrl}
```
If you use multiple configuration files this substitution takes all properties across all files into
account.

## Usage with webpack

This plugin can also be used with webpack, for example if you want to use global variables in
your web application that shall be stored in YAML configuration files. Here you can find an example
for your `webpack.config.js`.
```javascript
const webpack = require('webpack')
const configReader = require('yml-config-reader')

module.exports = (env) => {
  const config = configReader.getByEnv(env.stage || 'test')

  return {
    plugins: [
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(config)
      })
    ]
  }
}
```
The config map is then available in your script files by using the variable `process.env`.

This example uses webpack environment variables to pass a proper value to the function `getByEnv`.
You can pass this value directly via the command line with `npm start -- --env.stage=qa`.
