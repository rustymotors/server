import { describe, expect, it } from "vitest";
import { MessageNode } from './MessageNode.js';

describe("MessageNode (was ServerMessage)", () => {
	describe(".sizeOf", () => {
		it("should have the correct minimum size", () => {
			const m = new MessageNode();
			// 11 (header) + 4 (default body: Buffer.alloc(4))
			expect(m.sizeOf).toBe(15);
		});
	});

	it("should serialize and deserialize correctly", () => {
		const m = new MessageNode();
		m.setSignature("MCOX");
		m.sequence = 1;
		m.setPayloadEncryption(true);  // flag bit 0x08
		m.setPayloadCompression(true); // flag bit 0x02  => flags = 0x0a
		m.msgNo = 613;

		const buffer = m.serialize();
		const result = new MessageNode();
		result.deserialize(buffer);

		expect(result.signature).toEqual(m.signature);
		expect(result.sequence).toEqual(m.sequence);
		expect(result.flags).toEqual(m.flags);
		expect(result.msgNo).toEqual(m.msgNo);
	});
});
