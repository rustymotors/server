import { describe, it, expect } from "vitest";
import { hexToBuffer, parsePacket, formatParsedPacket } from "./parsePacket.js";

describe("hexToBuffer", () => {
    it("accepts spaces, colons and a 0x prefix", () => {
        expect(hexToBuffer("0x01 02:03")).toEqual(Buffer.from([1, 2, 3]));
    });

    it("rejects empty input, odd digit counts and non-hex characters", () => {
        expect(() => hexToBuffer("  ")).toThrow("No hex digits");
        expect(() => hexToBuffer("abc")).toThrow("Odd number");
        expect(() => hexToBuffer("zz")).toThrow("not a hex digit");
    });
});

describe("parsePacket", () => {
    it("reads an NPS header and names the message id", () => {
        // id 0x0100 (USER_LOGIN), length 6, body 0xaabb
        const parsed = parsePacket("0100 0006 aabb");
        expect(parsed.protocol).toBe("NPS");
        expect(parsed.nps?.messageId).toBe(0x100);
        expect(parsed.nps?.names).toContain("USER_LOGIN");
        expect(parsed.nps?.length).toBe(6);
        expect(parsed.nps?.body).toEqual(Buffer.from([0xaa, 0xbb]));
    });

    it("reports an id that is not in the table with no names", () => {
        const parsed = parsePacket("ffee0004");
        expect(parsed.protocol).toBe("NPS");
        expect(parsed.nps?.names).toEqual([]);
        expect(formatParsedPacket(parsed).join("\n")).toContain("not in NPS_MESSAGE_IDS");
    });

    it("detects HTTP", () => {
        expect(parsePacket(Buffer.from("GET / HTTP/1.1\r\n")).protocol).toBe("HTTP");
    });

    it("detects an HTTP response", () => {
        expect(parsePacket(Buffer.from("HTTP/1.1 200 OK\r\n")).protocol).toBe("HTTP");
    });

    it("detects MCOTS by the TOMC marker and checks its length", () => {
        // length 4 (LE) + "TOMC" + 2 more bytes = 6 bytes total counted, buffer is 8
        const parsed = parsePacket("0600544f4d4301ff");
        expect(parsed.protocol).toBe("MCOTS");
        expect(parsed.mcots).toEqual({ length: 6, complete: true });
        expect(parsePacket("0900544f4d4301ff").mcots?.complete).toBe(false);
    });

    it("calls a buffer whose length field does not match unknown", () => {
        expect(parsePacket("01000099aabb").protocol).toBe("Unknown");
    });
});
