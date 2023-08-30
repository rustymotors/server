import { describe, it, expect } from 'vitest'
import { LoginServer } from '../src/index.js'
import { mockDatabaseManager, mockLogger } from '../../../test/factoryMocks.js'

describe('LoginServer', () => {

    describe('constructor', () => {
        it('should create a new instance', () => {
            const loginServer = new LoginServer(mockDatabaseManager(), mockLogger())
            expect(loginServer).toBeDefined()
        })
    })
})
