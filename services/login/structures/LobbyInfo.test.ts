import { LobbyInfo } from "./LobbyInfo.js";

describe("LobbyInfo", () => {
  test("inherits getField() from parent class", () => {
    // Arrange
    const expectedType = "function";

    // Act
    const lobbyInfoStructure = new LobbyInfo();

    // Assert
    expect(typeof lobbyInfoStructure.getField).toEqual(expectedType);
  });
});
