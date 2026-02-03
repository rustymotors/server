import { describe, expect, it } from "vitest";
import { LoginInfoMessage } from "../src/LoginInfoMessage.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Real LoginInfoMessage packet from session fixture (opCode 0x0100 = 256)
// From session_7ea68e76_7003_2026-01-11T00-37-55.json, data_in event
const FIXTURE_PACKET_HEX = "0100008f000000150000000944722042726f776e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000054b46c0000000000000008342e352e302e3000000000046d636f000000000a31302e31302e352e3800ba7e6a9dbbd72029f837d90e4f1f0dca";

function hexToBuffer(hex: string): Buffer {
	return Buffer.from(hex, "hex");
}

describe("LoginInfoMessage", () => {
	describe("deserialize()", () => {
		it("should not cause infinite recursion when calling _header._doDeserialize()", () => {
			// Arrange - Use real packet from session fixture
			const fixtureBuffer = hexToBuffer(FIXTURE_PACKET_HEX);
			
			// Act & Assert
			// This should not throw a RangeError (stack overflow)
			// and should complete in a reasonable time
			expect(() => {
				const deserialized = new LoginInfoMessage();
				deserialized.deserialize(fixtureBuffer);
				
				// Verify it actually deserialized correctly
				expect(deserialized._header.id).toBe(0x0100); // 256
				expect(deserialized._header.length).toBe(0x008f); // 143
				expect(deserialized._userId).toBe(21); // 0x00000015
				expect(deserialized._userName).toBe("Dr Brown");
			}).not.toThrow();
		});

		it("should only deserialize header when _header._doDeserialize() is called", () => {
			// Arrange
			const message = new LoginInfoMessage();
			message._header.id = 0x5678;
			message._header.length = 200;
			
			// Create a buffer with header + some payload
			const headerBuffer = message._header._doSerialize();
			const payloadBuffer = Buffer.alloc(196); // 200 - 4 (header size)
			const fullBuffer = Buffer.concat([headerBuffer, payloadBuffer]);
			
			// Act
			const testMessage = new LoginInfoMessage();
			testMessage._header._doDeserialize(fullBuffer);
			
			// Assert
			// Header should be deserialized
			expect(testMessage._header.id).toBe(0x5678);
			expect(testMessage._header.length).toBe(200);
			
			// But payload should NOT be deserialized (data should still be empty/default)
			// This verifies _header._doDeserialize() only does header, not full deserialize
			expect(testMessage._userId).toBe(0); // Still default value
			expect(testMessage._userName).toBe(""); // Still default value
		});

		it("should correctly deserialize a real packet from session fixture", () => {
			// Arrange - Use real packet from session fixture
			const fixtureBuffer = hexToBuffer(FIXTURE_PACKET_HEX);
			
			// Act
			const deserialized = new LoginInfoMessage();
			deserialized.deserialize(fixtureBuffer);
			
			// Assert - Verify it deserialized the real packet correctly
			expect(deserialized._header.id).toBe(0x0100); // 256 - NPS_LoginInfo
			expect(deserialized._header.length).toBe(0x008f); // 143 bytes total
			expect(deserialized._userId).toBe(21); // 0x00000015
			expect(deserialized._userName).toBe("Dr Brown");
			// Additional fields can be verified if needed
		});
	});

	describe("serialize() and deserialize() round-trip", () => {
		it("should correctly deserialize and re-serialize a real packet", () => {
			// Arrange - Use real packet from session fixture
			const fixtureBuffer = hexToBuffer(FIXTURE_PACKET_HEX);
			
			// Act - Deserialize the real packet
			const deserialized = new LoginInfoMessage();
			deserialized.deserialize(fixtureBuffer);
			
			// Serialize it back
			const reserialized = deserialized.serialize();
			
			// Deserialize again to verify round-trip
			const roundTrip = new LoginInfoMessage();
			roundTrip.deserialize(reserialized);
			
			// Assert - Verify the round-trip preserved the data
			expect(roundTrip._header.id).toBe(0x0100);
			expect(roundTrip._userId).toBe(21);
			expect(roundTrip._userName).toBe("Dr Brown");
		});
	});
});
