import { fetchPersonas } from "./index";

describe('fetchPersonas()', () => {
    test('should return multiple persona records', () => {
        // Arrange

        // Act
        const personaList = fetchPersonas()

        // Assert
        expect(personaList.length).toBeGreaterThan(0)
    })
})