import { describe, expect, it, vi } from "vitest";
import { mockPino } from "../../../test/factoryMocks.js";
import { getServerLogger } from "../../shared/log.js";
import { CastanetResponse, PatchServer } from "../src/PatchServer.js";

describe("PatchServer", () => {
	it("should return the hard-coded value that tells the client there are no updates or patches", () => {
		// Arrange
		mockPino();
		const log = getServerLogger({ module: "Patch" });
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
