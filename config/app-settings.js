const winston = require('winston')
const path = require('path')

const ipServer = '192.168.5.20'
const certFilename = 'cert.pem'
const privateKeyFilename = 'private_key.pem'
const publicKeyFilename = 'pub.key'
const connectionURL = 'sqlite:memory:'

/**
 *
 *
 * @typedef WinstonConfigs
 * @property {winston.LoggerOptions} silllyLogConfig
 */

/**
 *
 *
 * @typedef ServerConfig
 * @property {string} certFilename
 * @property {string} ipServer
 * @property {string} privateKeyFilename
 * @property {string} publicKeyFilename
 * @property {string} connectionURL
 */

/**
 *
 *
 * @typedef AppSettings
 * @property {WinstonConfigs} winston
 * @property {ServerConfig} serverConfig
 */

/** @type {AppSettings} */
const appSettings = {
  winston: {
    silllyLogConfig: {
      level: 'silly',
      transports: [
        new winston.transports.File({
          filename: './logs/silly.log'
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.simple(),
            winston.format.colorize({ all: true })
          )
        })
      ]
    }
  },
  serverConfig: {
    certFilename: path.join(process.cwd(), 'data', certFilename),
    ipServer,
    privateKeyFilename: path.join(process.cwd(), 'data', privateKeyFilename),
    publicKeyFilename: path.join(process.cwd(), 'data', publicKeyFilename),
    connectionURL
  }
}

module.exports = appSettings
