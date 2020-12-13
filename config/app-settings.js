const winston = require('winston')

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
  * @property {string} registryFilename
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
            winston.format.colorize({ all: true})
          ),
        })
      ]
    }
  },
  serverConfig: {
    certFilename: './data/cert.pem',
    ipServer: '192.168.5.20',
    privateKeyFilename: './data/private_key.pem',
    publicKeyFilename: './data/pub.key',
    registryFilename: './data/sample.reg'
  }
}

module.exports = appSettings
