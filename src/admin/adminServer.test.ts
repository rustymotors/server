import { IncomingMessage, ServerResponse } from "http";
import { getAdminServer } from "./index.js";
import { SocketFactory } from "../socket-factory.js";
import { getConnectionManager } from "../core/connection-mgr.js";
import { TCPConnection } from "../core/tcpConnection.js";
import { EncryptionManager } from "../core/encryption-mgr.js";

describe("AdminServer", () => {
  describe("handleRequest()", function () {
    it("should handle a connections list request when connection has a valid remote address", function () {
      // Arrange
      const testSocket = SocketFactory.createSocket();
      const testIncommingMessage = new IncomingMessage(testSocket);
      const newConnection = new TCPConnection("testConnection", testSocket);
      newConnection.setEncryptionManager(new EncryptionManager());
      getConnectionManager().addConnection(newConnection);
      testIncommingMessage.url = "/admin/connections";
      const testServerResponse = new ServerResponse(testIncommingMessage);
      const expectedStatusCode = 200;

      // Act
      const handledRequest = getAdminServer().handleRequest(
        testIncommingMessage,
        testServerResponse
      );

      // Assert
      expect(handledRequest.statusCode).toEqual(expectedStatusCode);
    });

    it("should handle a connection queue reset request with connections", function () {
      // Arrange
      const testIncommingMessage = new IncomingMessage(
        SocketFactory.createSocket()
      );
      testIncommingMessage.url = "/admin/connections/resetAllQueueState";
      const testServerResponse = new ServerResponse(testIncommingMessage);
      const expectedStatusCode = 200;

      // Act
      const handledRequest = getAdminServer().handleRequest(
        testIncommingMessage,
        testServerResponse
      );

      // Assert
      expect(handledRequest.statusCode).toEqual(expectedStatusCode);
    });

    it("should handle a connection queue reset request with no connections", function () {
      // Arrange
      const testIncommingMessage = new IncomingMessage(
        SocketFactory.createSocket()
      );
      testIncommingMessage.url = "/admin/connections/resetAllQueueState";
      const testServerResponse = new ServerResponse(testIncommingMessage);
      const expectedStatusCode = 200;

      // Act
      getConnectionManager().clearConnectionList()
      const handledRequest = getAdminServer().handleRequest(
        testIncommingMessage,
        testServerResponse
      );

      // Assert
      expect(handledRequest.statusCode).toEqual(expectedStatusCode);
    });


    it("should return 404 on other admin urls", function () {
      // Arrange
      const testIncommingMessage = new IncomingMessage(
        SocketFactory.createSocket()
      );
      testIncommingMessage.url = "/admin/login";
      const testServerResponse = new ServerResponse(testIncommingMessage);
      const expectedStatusCode = 404;

      // Act
      const handledRequest = getAdminServer().handleRequest(
        testIncommingMessage,
        testServerResponse
      );

      // Assert
      expect(handledRequest.statusCode).toEqual(expectedStatusCode);
    });
  });
  test("handleRequest(), when passed an IncommingRequest and a ServerResponse, returns a ServerResponse", () => {
    // Arrange
    const testIncommingMessage = new IncomingMessage(
      SocketFactory.createSocket()
    );
    testIncommingMessage.url = "/admin/connections";
    const testServerResponse = new ServerResponse(testIncommingMessage);

    // Act
    const handledRequest = getAdminServer().handleRequest(
      testIncommingMessage,
      testServerResponse
    );

    // Assert
    expect(handledRequest.req).toStrictEqual(testIncommingMessage);
  });
});
