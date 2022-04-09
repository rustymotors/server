import { getConnectionManager } from "./connection-mgr.js";

describe("ConnectionManager", () => {
  test("when fetchConnectionList() is called in an instance of ConnectionManager, an array is returned", () => {
    // Arrange
    const connectionManagerInstance = getConnectionManager();

    // Act
    const connectionList = connectionManagerInstance.fetchConnectionList();

    // Assert
    expect(Array.isArray(connectionList)).toBeTruthy();
  });
});
