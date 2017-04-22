/* global it describe */
const config = require('./config.js')
/* eslint no-unused-vars: 0 */
const should = require('should')

describe('Config', () => {
    it('should have loggerLevel', () => {
        config.loadConfig().should.have.property('loggerLevel')
    })

    it('should have serverConfig', () => {
        config.loadConfig().should.have.property('serverConfig')
    })
})
