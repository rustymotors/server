import type { Socket } from "net";
import { describe, expect, it, vi } from "vitest";
import { tagSocketWithId, trySocketWrite } from "../src/socketUtility.js";

describe("tagSocketWithId", () => {
	it("returns an object with the correct properties", () => {
		// arrange
		const mockSocket = {} as Socket;
		const connectionStamp = Date.now();
		const id = "12345";

		// act
		const result = tagSocketWithId(mockSocket, connectionStamp, id);

		// assert
		expect(result).toHaveProperty("id");
		expect(result).toHaveProperty("socket");
		expect(result).toHaveProperty("connectionStamp");
	});

	it("returns an object with the correct values", () => {
		// arrange
		const mockSocket = {} as Socket;
		const connectionStamp = Date.now();
		const id = "12345";

		// act
		const result = tagSocketWithId(mockSocket, connectionStamp, id);

		// assert
		expect(result.id).toBe(id);
		expect(result.socket).toBe(mockSocket);
		expect(result.connectionStamp).toBe(connectionStamp);
	});

	describe("tagSocketWithId", () => {
		it("returns an object with the correct properties", () => {
			// arrange
			const mockSocket = {} as Socket;
			const connectionStamp = Date.now();
			const id = "12345";

			// act
			const result = tagSocketWithId(mockSocket, connectionStamp, id);

			// assert
			expect(result).toHaveProperty("id");
			expect(result).toHaveProperty("socket");
			expect(result).toHaveProperty("connectionStamp");
		});

		it("returns an object with the correct values", () => {
			// arrange
			const mockSocket = {} as Socket;
			const connectionStamp = Date.now();
			const id = "12345";

			// act
			const result = tagSocketWithId(mockSocket, connectionStamp, id);

			// assert
			expect(result.id).toBe(id);
			expect(result.socket).toBe(mockSocket);
			expect(result.connectionStamp).toBe(connectionStamp);
		});
	});

	describe("trySocketWrite", () => {
		it("resolves when data is successfully written", async () => {
			// arrange
			const mockTaggedSocket = {
				id: "12345",
				connectionStamp: Date.now(),
				socket: {
					write: vi.fn((_data, callback) => callback()),
				},
			};
			const data = "test data";

			// act & assert
			await expect(trySocketWrite(mockTaggedSocket, data)).resolves.toBeUndefined();
			expect(mockTaggedSocket.socket.write).toHaveBeenCalledWith(data, expect.any(Function));
		});

		it("rejects when an error occurs during write", async () => {
			// arrange
			const mockTaggedSocket = {
				id: "12345",
				connectionStamp: Date.now(),
				socket: {
					write: vi.fn((_data, callback) => callback(new Error("Write error"))),
				},
			};
			const data = "test data";

			// act & assert
			await expect(trySocketWrite(mockTaggedSocket, data)).rejects.toThrow(
				"Write error",
			);
			expect(mockTaggedSocket.socket.write).toHaveBeenCalledWith(data, expect.any(Function));
		});
	});
});
