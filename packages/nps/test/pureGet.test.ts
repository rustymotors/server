import { describe, expect, it } from "vitest";
import {
    getWord,
    getDWord,
    getNBytes,
    getAsHex,
    getLenString,
    getLenBlob,
    getShortBool,
} from "../src/utils/pureGet";

describe("getWord", () => {
    it("returns the word at the specified offset in little-endian format", () => {
        const bytes = Buffer.from([0x01, 0x00, 0x02, 0x00]);
        expect(getWord(bytes, 0, true)).toBe(1);
        expect(getWord(bytes, 2, true)).toBe(2);
    });

    it("returns the word at the specified offset in big-endian format", () => {
        const bytes = Buffer.from([0x00, 0x01, 0x00, 0x02]);
        expect(getWord(bytes, 0, false)).toBe(1);
        expect(getWord(bytes, 2, false)).toBe(2);
    });
});

describe("getDWord", () => {
    it("returns the dword at the specified offset in little-endian format", () => {
        const bytes = Buffer.from([
            0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00,
        ]);
        expect(getDWord(bytes, 0, true)).toBe(1);
        expect(getDWord(bytes, 4, true)).toBe(2);
    });

    it("returns the dword at the specified offset in big-endian format", () => {
        const bytes = Buffer.from([
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        ]);
        expect(getDWord(bytes, 0, false)).toBe(1);
        expect(getDWord(bytes, 4, false)).toBe(2);
    });
});

describe("getNBytes", () => {
    it("returns the first n bytes of a buffer", () => {
        const bytes = Buffer.from([0x01, 0x02, 0x03, 0x04]);
        expect(getNBytes(bytes, 2)).toEqual(Buffer.from([0x01, 0x02]));
        expect(getNBytes(bytes, 4)).toEqual(
            Buffer.from([0x01, 0x02, 0x03, 0x04]),
        );
        expect(getNBytes(bytes, 6)).toEqual(
            Buffer.from([0x01, 0x02, 0x03, 0x04]),
        );
    });
});

describe("getAsHex", () => {
    it("returns the hexadecimal string representation of a buffer", () => {
        const bytes1 = Buffer.from([0x01, 0x02, 0x03]);
        const bytes2 = Buffer.from([0x01, 0x02, 0x03, 0x04]);
        expect(getAsHex(bytes1)).toBe("010203");
        expect(getAsHex(bytes2)).toBe("01020304");
    });

    it("adds a leading zero if the length of the hexadecimal string is odd", () => {
        const bytes = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
        expect(getAsHex(bytes)).toBe("0102030405");
    });
});

describe("getLenString", () => {
    it("returns the string from a buffer based on the given offset and length in little-endian format", () => {
        const bytes = Buffer.from([0x05, 0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
        expect(getLenString(bytes, 0, true)).toBe("Hello");
    });

    it("returns the string from a buffer based on the given offset and length in big-endian format", () => {
        const bytes = Buffer.from([0x00, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
        expect(getLenString(bytes, 0, false)).toBe("Hello");
    });
});

describe("getLenBlob", () => {
    it("returns the blob from a buffer based on the given offset and length in little-endian format", () => {
        const bytes = Buffer.from([0x05, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
        expect(getLenBlob(bytes, 0, true)).toEqual(
            Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]),
        );
    });

    it("returns the blob from a buffer based on the given offset and length in big-endian format", () => {
        const bytes = Buffer.from([0x00, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05]);
        expect(getLenBlob(bytes, 0, false)).toEqual(
            Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]),
        );
    });
});

describe("getShortBool", () => {
    it("returns the 2-byte boolean value from the specified buffer at the given offset", () => {
        const bytes = Buffer.from([0x01, 0x00, 0x00, 0x00]);
        expect(getShortBool(bytes, 0)).toBe(true);
        expect(getShortBool(bytes, 2)).toBe(false);
    });
});
