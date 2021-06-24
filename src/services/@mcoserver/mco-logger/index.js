// @ts-check
// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { name: packageName } = require('../../../../package.json')

/**
 * @module MCO_Logger
 */



/**
 *
 * @param {string|Object} message
 * @param {Object} [options]
 * @param {Object} [options.args] optional args passed from program
 * @param {string} [options.level] optional logging level
 * @param {string} [options.service] optional name of service to append
 * @returns void
 */
function log(message, options = {
  service: getServiceName(),
  level: getDefaultLevel()
}) {

  const meta = `{ service: ${getServiceName(options)}, level: ${getLogLevel(options)}}`

  switch (options.level) {
    case 'debug':
      if (shouldDebug(options)) {
        console.debug(`${message}, ${meta}`)
      }

      break
    case 'error':
      console.error(`${message}, ${meta}`)
      break
    case 'warn':
      console.error(`${message}, ${meta}`)
      break
    default:
      console.log(`${message}, ${meta}`)
      break
  }
}

/**
 * 
 * @param {string|Object} message
 * @param {Object} [options]
 * @param {Object} [options.args] optional args passed from program
 * @param {string} [options.level] optional logging level
 * @param {Object} [options.service] optional name of service to append
 * @returns 
 */
function debug(message, options) {
  const newOptions = { args: options.args, service: options.service, level: 'debug' }
  return log(message, newOptions)
}

/**
 * Return the logging level as set by $MCO_LOG_LEVEL or 'info'
 * @returns {string}
 */
function getDefaultLevel() {
  return process.env.MCO_LOG_LEVEL || 'info'
}

function getDefaultService() {
  return packageName
}

/**
 *
 * @param {Object} [options]
 * @param {Object} [options.args] optional args passed from program
 * @param {string} [options.level] optional logging level
 * @param {Object} [options.service] optional name of service to append
 * @returns {string}
 */
function getLogLevel(options) {
  if (options && options.level) {
    return options.level
  }
  return getDefaultLevel()
}

/**
 *
 * @param {Object} [options]
 * @param {Object} [options.args] optional args passed from program
 * @param {string} [options.level] optional logging level
 * @param {Object} [options.service] optional name of service to append
 * @returns {string}
 */
function getServiceName(options) {
  if (options && options.service) {
    return options.service
  }
  return packageName
}

/**
 *
 * @param {Object} [options]
 * @param {Object} [options.args] optional args passed from program
 * @param {string} [options.level] optional logging level
 * @param {Object} [options.service] optional name of service to append
 * @returns {boolean}
 */
function shouldDebug(options) {
  return (options.args && options.args.verbose)
    || getLogLevel() === 'debug'
    || getDefaultLevel() === 'silly'
}

module.exports = {
  debug,
  getDefaultLevel,
  getDefaultService,
  getLogLevel,
  getServiceName,
  log,
  shouldDebug,
}