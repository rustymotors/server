import { describe, expect, it } from "vitest";
import { LegacyMessage } from "../src/LegacyMessage.js";

describe("LegacyMessage", () => {
	describe("_header._doDeserialize()", () => {
		it("should not cause infinite recursion when called", () => {
			// Arrange
			const message = new LegacyMessage();
			message._header.id = 0x1234;
			message._header.length = 20;
			message.setBuffer(Buffer.alloc(16)); // 20 - 4 (header size)
			
			const serialized = message.serialize();
			
			// Act & Assert
			// This should not throw a RangeError (stack overflow)
			// The key test: _header._doDeserialize() should only deserialize the header,
			// not call deserialize() which would cause infinite recursion
			expect(() => {
				const testMessage = new LegacyMessage();
				testMessage._header._doDeserialize(serialized);
				
				// Verify header was deserialized
				expect(testMessage._header.id).toBe(0x1234);
				expect(testMessage._header.length).toBe(20);
				
				// Verify payload was NOT deserialized (this proves it only did header)
				// The data should still be empty/default
				expect(testMessage.data.length).toBe(0);
			}).not.toThrow();
		});

		it("should only deserialize the header, not the full message", () => {
			// Arrange
			const buffer = Buffer.alloc(100);
			buffer.writeUInt16BE(0xABCD, 0); // header id
			buffer.writeUInt16BE(100, 2); // header length
			buffer.writeUInt32BE(0xDEADBEEF, 4); // some payload data
			
			// Act
			const message = new LegacyMessage();
			message._header._doDeserialize(buffer);
			
			// Assert
			// Header should be deserialized
			expect(message._header.id).toBe(0xABCD);
			expect(message._header.length).toBe(100);
			
			// But data should NOT be populated (proves it didn't call full deserialize())
			expect(message.data.length).toBe(0);
		});
	});

	describe("deserialize()", () => {
		it("should deserialize header and payload correctly", () => {
			// Arrange
			const original = new LegacyMessage();
			original._header.id = 0x5678;
			const payload = Buffer.from([1, 2, 3, 4, 5]);
			original.setBuffer(payload);
			
			const serialized = original.serialize();
			
			// Act
			const deserialized = new LegacyMessage();
			deserialized.deserialize(serialized);
			
			// Assert
			expect(deserialized._header.id).toBe(0x5678);
			expect(deserialized._header.length).toBe(9); // 4 (header) + 5 (payload)
			expect(deserialized.data).toEqual(payload);
		});
	});

	describe("serialize() and deserialize() round-trip", () => {
		it("should correctly serialize and deserialize", () => {
			// Arrange
			const original = new LegacyMessage();
			original._header.id = 0x9999;
			const payload = Buffer.from("test data");
			original.setBuffer(payload);
			
			// Act
			const serialized = original.serialize();
			const deserialized = new LegacyMessage();
			deserialized.deserialize(serialized);
			
			// Assert
			expect(deserialized._header.id).toBe(original._header.id);
			expect(deserialized._header.length).toBe(original._header.length);
			expect(deserialized.data).toEqual(original.data);
		});
	});
});
