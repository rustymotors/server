import { PatchServer, CastanetResponse } from "../src/PatchServer.js";
import { describe, it, expect, vi } from "vitest";
import { mockLogger } from "../../../test/factoryMocks.js";

describe("PatchServer", () => {
    it("should return the hard-coded value that tells the client there are no updates or patches", () => {
        // Arrange
        const log = mockLogger();
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
        patchServer.castanetResponse(request as any, response as any);

        // Assert
        expect(response.setHeader).toHaveBeenCalledWith(
            CastanetResponse.header.type,
            CastanetResponse.header.value,
        );
        expect(response.end).toHaveBeenCalledWith(CastanetResponse.body);
    });
});
