import type { IncomingMessage, ServerResponse } from "http";
import { describe, expect, it, vi } from "vitest";
import { CastanetResponse, PatchServer } from "../src/PatchServer.js";
import { TServerLogger } from "@rustymotors/shared";

describe("PatchServer", () => {
  it("should return the hard-coded value that tells the client there are no updates or patches", () => {
    // Arrange
    const log: TServerLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      fatal: vi.fn(),
      getName: vi.fn(),
      resetName: vi.fn(),
      setName: vi.fn(),
    };
    const patchServer = PatchServer.getInstance(log);
    const request = {
      socket: {
        remoteAddress: "",
      },
      method: "",
      url: "",
    };
    const response = {
      setHeader: vi.fn(),
      writeHead: vi.fn(),
      end: vi.fn(),
    };

    // Act
    patchServer.castanetResponse(
      request as IncomingMessage,
      response as unknown as ServerResponse
    );

    // Assert
    expect(response.setHeader).toHaveBeenCalledWith(
      CastanetResponse.header.type,
      CastanetResponse.header.value
    );
    expect(response.end).toHaveBeenCalledWith(CastanetResponse.body);
  });
});
