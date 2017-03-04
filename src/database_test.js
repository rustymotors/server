/* global it describe should */
const database = require('./database.js')
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const should = require('should')

describe('Databases', () => {
  it('should be able to create tables', (done) => {
    database.dbCreateTables((err, res) => {
      if (err) {
        err.should.equal('moo')
        done()
      }
      should.not.exist(res)
      done()
    })
  })
  it('should be able to write to the database', (done) => {
    database.dbInsertPersonas((err, res) => {
      if (err) {
        err.should.equal('moo')
        done()
      }
      should.not.exist(res)
      done()
    })
  })
  it('should be able to fetch persona by customer id', (done) => {
    database.dbFetchPersonaByCustomerId('Zeta 3', (err, res) => {
      if (err) {
        err.should.equal('moo')
        done()
      }
      JSON.parse(res).racer_name.should.equal('Lorem 3')
      done()
    })
  })
  it('should be able to delete from the database', (done) => {
    database.dbDeletePersonas((err, res) => {
      if (err) {
        err.should.equal('moo')
        done()
      }
      should.not.exist(res)
      done()
    })
  })
})
