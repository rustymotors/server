import { describe, it, expect, vi } from "vitest";
import { socketErrorHandler } from "./socketErrorHandler.js";
import { type ServerLogger } from "rusty-motors-shared";

describe("socketErrorHandler", () => {

	it("should log a debug message when error code is ECONNRESET", () => {
		const connectionId = "12345";
		const error = { code: "ECONNRESET" } as NodeJS.ErrnoException;
        const mockLogger = {
            debug: vi.fn(),
        } as unknown as ServerLogger;
    

		socketErrorHandler({ connectionId, error, log: mockLogger });

		expect(mockLogger.debug).toHaveBeenCalledWith(
			`Connection ${connectionId} reset`,
		);
	});

	it("should throw an error when error code is not handled", () => {
		const connectionId = "12345";
		const error = {
			code: "EUNKNOWN",
			message: "Unknown error",
		} as NodeJS.ErrnoException;
        const mockLogger = {
            debug: vi.fn(),
        } as unknown as ServerLogger;
    

		expect(() =>
			socketErrorHandler({ connectionId, error, log: mockLogger }),
		).toThrow(`Socket error: ${error.message} on connection ${connectionId}`);
	});

});
