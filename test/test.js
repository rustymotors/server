var database = require(../src/mco_server/database.js)
var should = require('should')
var assert = require('chai').assert;
describe('Files', function() {
  it('should locate the pub.key file');
  it('should locate the private_key.pem file');
  it('should locate the database file, if sqlite3 is used', function() {
    database.init('../users.db')
    'foo'.should.equal('foo')
  });
});

describe('Databases', function() {
  it('should be able to open the database');
  it('should be able to write to the database');
  it('should be able to read to the database');
  it('should be able to delete from the database');
});

describe('Connections', function() {
  it('should be able to connect to the login port');
  it('should be able to connect to the persona port');
  it('should be able to connect to the lobby port');
  it('should be able to connect to the admin port');
});

describe('Encryption', function() {
  it('should be able to encrypt 1 NPS command in a row');
  it('should be able to encrypt 2 NPS commands in a row');
  it('should be able to decrypt 1 NPS command in a row');
  it('should be able to decrypt 2 NPS commands in a row');
});

describe('NPS Commands', function() {
  it('should be able to understand NPSGetPersonaInfoByName');
});

describe('Admin API', function() {
  it('should be able to understand start on port xxxx');
  it('should be able to understand stop on port xxxx');
});