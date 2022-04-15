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
})