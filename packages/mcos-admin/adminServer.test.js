import { describe } from "mocha"
import chai from "chai"
import { AdminServer } from "./index.js"

const should = chai.should()

describe('AdminServer', function() {
    describe('.getAdminServer', function() {
        it('should return an instance of AdminServer', function() {
            // Act
            const newAdminInstance = AdminServer.getAdminServer()            

            // Assert
            newAdminInstance.should.be.instanceOf(AdminServer)
        })
        it('should return the same instance of AdminServer on multiple calls', function() {
            // Act
            const admin1 = AdminServer.getAdminServer()
            const admin2 = AdminServer.getAdminServer()

            // Assert
            admin1.should.equal(admin2)
        })
    })
})