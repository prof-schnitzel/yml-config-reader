const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const _merge = require('lodash/merge')
const _mapValues = require('lodash/mapValues')
const _isPlainObject = require('lodash/isPlainObject')
const _isString = require('lodash/isString')
const _isArray = require('lodash/isArray')
const _has = require('lodash/has')
const _get = require('lodash/get')

/**
 * Returns environment specific config. Takes default settings from config.default.yml
 * and merges them with settings from config.${environment}.yml.
 *
 * @param environment Environment which has to be part of the filename
 * @param folder If specified, the config files are taken from that folder.
 * @returns Config object
 */
function getByEnv(environment, folder) {
  folder = folder ? (folder.replace('/', '') + '/') : ''
  if (environment) {
    return getByFiles(`${folder}config.default.yml`, `${folder}config.${environment}.yml`)
  }
  return getByFiles(`${folder}config.default.yml`)
}

/**
 * Returns config object. Multiple config files can be specified, with values in
 * later files taking precedence.
 *
 * @param files
 * @returns Config object
 */
function getByFiles(...files) {
  const config = readFiles(...files)
  return handleCompoundVars(config, config)
}

function readFiles(...files) {
  let totalConfig = {}
  files.forEach(filename => {
    const file = path.join(path.dirname(module.parent.filename), filename)
    if (fs.existsSync(file)) {
      const fileConfig = yaml.safeLoad(fs.readFileSync(file, 'utf8'))
      totalConfig = mergeWithConfig(totalConfig, fileConfig)
    }
  })
  return totalConfig
}

function substituteVars(val, totalConfig) {
  return val.replace(/\${([\w.-]+)}/g, function (_, term) {
    if (_has(totalConfig, term)) {
      return _get(totalConfig, term)
    }
    throw new Error(`Property ${term} not found in any config file.`)
  })
}

function handleCompoundVars(configPart, totalConfig) {
  return _mapValues(configPart, (val) => {
    if (_isPlainObject(val)) {
      const substituted = handleCompoundVars(val, totalConfig)
      return substituted
    } else if (_isString(val)) {
      const substituted = substituteVars(val, totalConfig)
      return substituted
    } else if (_isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (_isString(val[i])) {
          val[i] = substituteVars(val[i], totalConfig)
        }
      }
    }
    return val
  })
}

function mergeWithConfig(totalConfig, fileConfig) {
  return _merge(totalConfig, fileConfig)
}

exports.getByEnv = getByEnv
exports.getByFiles = getByFiles
