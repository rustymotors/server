import { describe, expect, it, vi } from "vitest";
import { getServerLogger } from "rusty-motors-shared";
import { CastanetResponse, PatchServer } from "../src/PatchServer.js";

describe("PatchServer", () => {
	it("should return the hard-coded value that tells the client there are no updates or patches", () => {
		// Arrange
		const log = getServerLogger({ name: "Patch" });
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
