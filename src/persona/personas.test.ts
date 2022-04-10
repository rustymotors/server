import { createEmptyNPSMessage } from "../factories/npsMessageFactory.js";
import { fetchPersonas, handleSelectGamePersona } from "./index.js";

describe("fetchPersonas()", () => {
  test("should return multiple persona records", () => {
    // Arrange

    // Act
    const personaList = fetchPersonas();

    // Assert
    expect(personaList.length).toBeGreaterThan(0);
  });
});

describe("handleSelectGamePersona()", () => {
  test("when passed an NPSMessage, should return an NPSMessage with the msgNo set to 0x2_07", async () => {
    // Arrange
    const inboundMessage = createEmptyNPSMessage({});

    // Act
    const outboundMessage = await handleSelectGamePersona(inboundMessage);

    // Assert
    expect(outboundMessage.msgNo).toEqual(0x2_07);
  });
});
