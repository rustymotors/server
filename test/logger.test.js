/* eslint-disable @typescript-eslint/no-var-requires */
const logger = require('../built/logger/index.js')
const { describe, it } = require('mocha')
var td = require("testdouble");
const chai = require('chai')
var tdChai = require("testdouble-chai");
const process = require('process');
const { info } = require('console');

chai.use(tdChai(td));
const { expect} = chai

/**
 * Logger should have a method for each level
 * logger log methods should call console.log with valid log messages
 * Logger should warn on console.error for invalid log value passed.
 * Logger
 * Logger should default to 6 when an invalid level is passed
 * Logger should have the corect value for each level name
 * Logger
 * Logger
 * Logger
 * Logger
 * Logger
 * Logger should only log a message if the message's level is lower or equal to the logger's internal level
 */

describe('Logger', function() {
    chai.use(tdChai(td))

    it('should throw a error if not passed a service name', function() {
        expect(function() { new logger.Logger()}).to.Throw()
    })

    it('should have am method that returns an array of possible levels', function() {
        expect(logger.Logger.getLoggableLevels()).to.deep.equal(["emergency", "alert", "critical", 'error', 'warning', 'notice', 'info', 'debug'])
    })

    it('should default to 6 (info) when no level is passed', function() {
        expect(new logger.Logger('testService').getLogLevel()).to.equal(6)
    })

    it('should support setting the leval via the env LOG_LEVEL', function() {
        process.env.LOG_LEVEL = '8'
        expect(new logger.Logger('testService').getLogLevel()).to.equal(8)
    })

    it('should support setting the leval via the env LOG_LEVEL', function() {
        process.env.LOG_LEVEL = '8'
        expect(new logger.Logger('testService').getLogLevel()).to.equal(8)
        delete process.env.LOG_LEVEL
    })

    it('should support setting the value via the env LOGGING_LEVEL', function() {
        process.env.LOGGING_LEVEL = 3
        expect(new logger.Logger('testService').getLogLevel()).to.equal(3)
        process.env.LOGGING_LEVEL
    })

    it('should have a log() method that calls console.log', function() {
        const tdLog = td.replace(console, 'log')
        new logger.Logger('testService').log()
        expect(tdLog).to.have.been.called
    })

    it('should have named logging levels match the syslog values', function() {
        expect(logger.Logger.LOGGABLE_LEVEL.emergency, 'emergency').to.equal(0)
        expect(logger.Logger.LOGGABLE_LEVEL.alert, 'alert').to.equal(1)
        expect(logger.Logger.LOGGABLE_LEVEL.critical, 'critical').to.equal(2)
        expect(logger.Logger.LOGGABLE_LEVEL.error, 'error').to.equal(3)
        expect(logger.Logger.LOGGABLE_LEVEL.warning, 'warning').to.equal(4)
        expect(logger.Logger.LOGGABLE_LEVEL.notice, 'notice').to.equal(5)
        expect(logger.Logger.LOGGABLE_LEVEL.info, info).to.equal(6)
        expect(logger.Logger.LOGGABLE_LEVEL.debug, 'debug').to.equal(7)
    })

})
