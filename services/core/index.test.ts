import { ICoreConfig, MCOServer } from "./index.js";
import { logger } from "../../src/logger/index.js";

describe('MCOServer', function() {
    it('init() should return an instance of MCOServer', function() {
        // Arrange
        const testConfig: ICoreConfig = {
            externalHost: '',
            logger
        }

        // Act
        const server = MCOServer.init(testConfig)

        // Assert
        expect(server instanceof MCOServer).toBeTruthy()
    })

    it('run() should set isRunning to true', function(done) {
        // Arrange
        const testConfig: ICoreConfig = {
            externalHost: '',
            logger,
            ports: [9999]
        }
        const server: MCOServer = MCOServer.init(testConfig)
        expect(server.isRunning).toBeFalsy()

        // Act
        server.run()

        // Assert
        expect(server.isRunning).toBeTruthy()
        server.stop()
        done()      
    })
})