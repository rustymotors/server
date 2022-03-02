import { IncomingMessage, ServerResponse } from "http";
import { getAdminServer } from "./index";
import { SocketFactory } from "../socket-factory";

describe("AdminServer", () => {
  test("handleRequest(), when passed an IncommingRequest and a ServerResponse, returns a ServerResponse", () => {
    // Arrange
    const testIncommingMessage = new IncomingMessage(
      SocketFactory.createSocket()
    );
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
