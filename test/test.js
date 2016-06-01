/* global it describe */
/* jshint unused: false */
var fs = require('fs')
var database = require('../src/mco_server/database.js')
var should = require('should')
// var assert = require('chai').assert()
describe('Files', function () {
  it.skip('should locate the pub.key file', function () {
    should(fs.statSync('./data/pub.key').isFile()).equal(true)
  })
  it.skip('should locate the private_key.pem file', function () {
    should(fs.statSync('./data/private_key.pem').isFile()).equal(true)
  })
  describe('Check for database files, if sqlite3 is used', function () {
    database.init('./data/')
    it('should locate the users database file', function () {
      should(fs.statSync('./data/users.db').isFile()).equal(true)
    })
    it('should locate the personas database file', function () {
      should(fs.statSync('./data/personas.db').isFile()).equal(true)
    })
    it('should locate the sessions database file', function () {
      should(fs.statSync('./data/sessions.db').isFile()).equal(true)
    })
    it('should locate the races database file', function () {
      should(fs.statSync('./data/races.db').isFile()).equal(true)
    })
  })
})

describe('Databases', function () {
  it('should be able to open the database')
  it('should be able to write to the database')
  it('should be able to read to the database')
  it('should be able to delete from the database')
})

describe('Connections', function () {
  it('should be able to connect to the login port')
  it('should be able to connect to the persona port')
  it('should be able to connect to the lobby port')
  it('should be able to connect to the admin port')
})

describe('Encryption', function () {
  it('should be able to encrypt 1 NPS command in a row')
  it('should be able to encrypt 2 NPS commands in a row')
  it('should be able to decrypt 1 NPS command in a row')
  it('should be able to decrypt 2 NPS commands in a row')
})

describe('NPS Commands', function () {
  it('should be able to understand NPSGetPersonaInfoByName')
})

describe('Admin API', function () {
  it('should be able to understand start on port xxxx')
  it('should be able to understand stop on port xxxx')
})
