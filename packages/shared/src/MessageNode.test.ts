import { describe, it, expect } from "vitest";
import { MessageNode, MessageNodeBody } from "./MessageNode.js";

describe("MessageNode", () => {
    it("serializes and deserializes correctly (roundtrip)", () => {
        const m = new MessageNode();
        m.sequence = 42;
        m.setPayloadEncryption(true);
        m.setPayloadCompression(true);
        m.msgNo = 0x1234;

        const buf = m.serialize();
        expect(buf.length).toBe(m.sizeOf);

        const m2 = new MessageNode();
        m2.deserialize(buf);

        expect(m2.length).toBe(9 + m.getBody().sizeOf);
        expect(m2.signature).toBe("TOMC");
        expect(m2.sequence).toBe(42);
        expect(m2.isPayloadEncrypted()).toBe(true);
        expect(m2.isPayloadCompressed()).toBe(true);
        expect(m2.msgNo).toBe(0x1234);

        // verify message number in serialized buffer (little-endian at offset 11)
        const bodyOffset = 11;
        expect(buf.readInt16LE(bodyOffset)).toBe(0x1234);
    });

    it("toggles payload encryption and compression flags", () => {
        const m = new MessageNode();
        expect(m.isPayloadEncrypted()).toBe(false);
        expect(m.isPayloadCompressed()).toBe(false);

        m.setPayloadEncryption(true);
        expect(m.isPayloadEncrypted()).toBe(true);
        expect((m.flags & 0x08) !== 0).toBe(true);

        m.setPayloadEncryption(false);
        expect(m.isPayloadEncrypted()).toBe(false);

        m.setPayloadCompression(true);
        expect(m.isPayloadCompressed()).toBe(true);
        expect((m.flags & 0x02) !== 0).toBe(true);

        m.setPayloadCompression(false);
        expect(m.isPayloadCompressed()).toBe(false);
    });

    it("sequence helpers and ensureNonZeroSequence behavior", () => {
        const m = new MessageNode();
        expect(m.isSequenceSet()).toBe(false);
        expect(() => m.ensureNonZeroSequence()).toThrow("please set sequence");

        m.sequence = 7;
        expect(m.isSequenceSet()).toBe(true);
        expect(() => m.ensureNonZeroSequence()).not.toThrow();
        expect(m.sequenceNumber).toBe(7);
        expect(m.seq).toBe(7);
    });

    it("signature validation and ensureValidSignature behavior", () => {
        const m = new MessageNode();
        expect(m.isSignatureValid()).toBe(true);
        expect(() => m.ensureValidSignature()).not.toThrow();

        m.setSignature("BAD!");
        expect(m.isSignatureValid()).toBe(false);
        expect(() => m.ensureValidSignature()).toThrow("Signature is not valid");
    });

    it("msgNo getter/setter updates body and serialized bytes", () => {
        const m = new MessageNode();
        m.msgNo = 0x7FFF; // valid 2-byte value
        expect(m.msgNo).toBe(0x7FFF);

        const buf = m.serialize();
        const bodyOffset = 11;
        expect(buf.readInt16LE(bodyOffset)).toBe(0x7FFF);
    });

    it("setBody updates internal body and msgLength_", () => {
        const m = new MessageNode();
        const newBody = new MessageNodeBody();
        // default body size is 2
        newBody.msgNumber = 5;
        m.setBody(newBody);
        // setBody sets msgLength_ to body.sizeOf
        expect(m.length).toBe(newBody.sizeOf);
        // serialized will reflect new body content at end
        const buf = m.serialize();
        expect(buf.readInt16LE(11)).toBe(5);
    });

    it("deprecated helpers produce expected outputs", () => {
        const m = new MessageNode();
        m.sequence = 9;
        const header = m.header;
        expect(header.mcoSig).toBe(m.signature);
        expect(header.length).toBe(m.length);

        expect(m.toHexString()).toBe(m.serialize().toString("hex"));
        // toString should start with the prefix
        expect(m.toString().startsWith("MessageNode:")).toBe(true);
    });
});