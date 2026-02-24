import { describe, it, expect } from "vitest";
import {
    Short,
    Long,
    NPS_LOGICAL,
    Bool,
    CString,
    CBlock,
    align,
    align4,
    padBuffer,
    sliceBuff,
    setBit,
    clearBit,
    getBit,
    setByte,
    checkSize2,
    checkSize4,
    doesBufferFit,
    checkMinLength,
    diffObj,
    shouldDeepDiff,
    areBothObjectsAnInstanceOf,
} from "./helpers.js";

describe("helpers.ts unit tests", () => {
    describe("Short", () => {
        it("reports sizeOf as 2 and serializes/deserializes int16", () => {
            const s = new Short();
            expect(s.sizeOf).toBe(2);

            s.value = 0x1234;
            const buf = s.serialize();
            expect(buf.byteLength).toBe(4); // current implementation returns 4 bytes
            expect(buf.readInt16BE(0)).toBe(0x1234);

            const s2 = new Short();
            s2.deserialize(Buffer.from([0xff, 0xfe])); // -2
            expect(s2.value).toBe(-2);
        });
    });

    describe("Long", () => {
        it("reports sizeOf as 4 and round-trips int32", () => {
            const l = new Long();
            expect(l.sizeOf).toBe(4);
            const val = 0x7fffffff;
            l.value = val;
            const buf = l.serialize();
            expect(buf.byteLength).toBe(4);
            expect(buf.readInt32BE(0)).toBe(val);

            const l2 = new Long();
            l2.deserialize(buf);
            expect(l2.value).toBe(val);
        });
    });

    describe("NPS_LOGICAL and Bool", () => {
        it("NPS_LOGICAL serializes true->1 and false->0 and deserializes", () => {
            const n = new NPS_LOGICAL();
            expect(n.sizeOf).toBe(2);
            n.value = true;
            const bTrue = n.serialize();
            expect(bTrue.byteLength).toBe(2);
            expect(bTrue.readInt16BE(0)).toBe(1);

            const n2 = new NPS_LOGICAL();
            n2.deserialize(Buffer.from([0x00, 0x01]));
            expect(n2.value).toBe(true);

            n.value = false;
            expect(n.serialize().readInt16BE(0)).toBe(0);
        });

        it("Bool serializes/deserializes single byte", () => {
            const bb = new Bool();
            expect(bb.sizeOf).toBe(1);
            bb.value = true;
            expect(bb.serialize().readInt8(0)).toBe(1);
            bb.value = false;
            expect(bb.serialize().readInt8(0)).toBe(0);

            const bb2 = new Bool();
            // deserialize a non-1 value should yield false per implementation
            bb2.deserialize(Buffer.from([0x02]));
            expect(bb2.value).toBe(false);
        });
    });

    describe("CString", () => {
        it("can serialize a string", () => {
            const testString = "Hello from Twin Pines!";
            const testStringLenWithNull = testString.length + 1
            const testStringLenWithNullAndPrefix = testStringLenWithNull + 4

            const s = new CString(24);
            s.set(testString);
            const ser = s.serialize();
            expect(ser.byteLength).toBe(testStringLenWithNullAndPrefix);
            expect(ser.toString("hex")).toBe(
                Buffer.concat([
                    Buffer.from([0, 0, 0, 23]),
                    Buffer.from(testString),
                    Buffer.from([0x0]),
                ]).toString("hex"),
            );
        });

        it("can deserialize a string", () => {
            const testString = "Hello from Twin Pines!";
            const testBuffer = Buffer.concat([
                Buffer.from([0, 0, 0, 23]),
                Buffer.from(testString),
                Buffer.from([0x0]),
            ]);

            const s = new CString(50);
            s.deserialize(testBuffer);
            const incodedString = s.toString();
            expect(incodedString).toBe(testString);
        });

        it("serializes and deserializes simple strings with length prefix and null terminator", () => {
            const cs = new CString(10);
            cs.set("hi");
            const buf = cs.serialize();
            // length prefix should be string length + 1 (for null)
            expect(buf.readInt32BE(0)).toBe(3);
            // payload bytes after 4 bytes length: "hi\0"
            expect(buf.subarray(4).toString("utf8")).toBe("hi\u0000");

            const cs2 = new CString(10);
            cs2.deserialize(buf);
            expect(cs2.toString()).toBe("hi");
            expect(cs2.length).toBe(3);
            expect(cs2.sizeOf).toBe(4 + 2 + 1);
        });

        it("throws when deserializing buffer smaller than 4 bytes", () => {
            const cs = new CString(5);
            expect(() => cs.deserialize(Buffer.alloc(3))).toThrowError(
                /need at least 4 bytes/,
            );
        });

        it("throws when setting a string longer than maxLen - 1", () => {
            const cs = new CString(3); // max payload length is 2 bytes (including null)
            expect(() => cs.set("tooLong")).toThrowError(/string can only be/);
        });

        it("compares two classes with the same max length as true", () => {
            const firstCString = new CString(5);
            const SecondCString = new CString(5);

            expect(CString.compare(firstCString, SecondCString)).toBeTruthy();
        });

        it("compares two classes with the same internal value as true", () => {
            const firstCString = new CString(5);
            firstCString.set("same");
            const SecondCString = new CString(5);
            SecondCString.set("same");

            expect(CString.compare(firstCString, SecondCString)).toBeTruthy();
        });

        it("compares two classes with different internal values as false", () => {
            const firstCString = new CString(5);
            firstCString.set("one");
            const SecondCString = new CString(5);
            SecondCString.set("two");

            expect(CString.compare(firstCString, SecondCString)).toBeFalsy();
        });
    });

    describe("CBlock", () => {
        it("throws when input buffer is larger than declared block size", () => {
            const blk = new CBlock(4);
            expect(() => blk.deserialize(Buffer.alloc(5))).toThrowError(
                /Input buffer too large/,
            );
        });

        it("serializes round-trip fixed size block", () => {
            const blk = new CBlock(4);
            const src = Buffer.from([0x11, 0x22, 0x33, 0x44]);
            blk.deserialize(src);
            const out = blk.serialize();
            expect(out.equals(src)).toBe(true);
            expect(out.byteLength).toBe(4);
        });
    });

    describe("alignment helpers", () => {
        it("align aligns numbers to given boundary", () => {
            expect(align(0, 8)).toBe(0);
            expect(align(1, 4)).toBe(4);
            expect(align(4, 4)).toBe(4);
            expect(align(5, 4)).toBe(8);
            expect(align4(5)).toBe(8);
            expect(align4(8)).toBe(8);
        });
    });

    describe("padBuffer", () => {
        it("pads to multiple of 4", () => {
            const a = Buffer.from([1, 2]);
            const p = padBuffer(a);
            expect(p.byteLength).toBe(4);
            expect(p.subarray(0, 2).equals(a)).toBe(true);
            expect(p.subarray(2).equals(Buffer.alloc(2))).toBe(true);

            const b = Buffer.from([1, 2, 3, 4]);
            expect(padBuffer(b).byteLength).toBe(4);
        });
    });

    describe("sliceBuff", () => {
        it("returns requested slice and throws when not enough bytes", () => {
            const buf = Buffer.from([1, 2, 3, 4, 5]);
            const slice = sliceBuff(buf, 1, 3);
            expect(slice.equals(Buffer.from([2, 3, 4]))).toBe(true);
            expect(() => sliceBuff(buf, 3, 5)).toThrowError(
                /input buffer not long enough/,
            );
        });
    });

    describe("bit helpers and setByte/checkSize", () => {
        it("setBit/clearBit/getBit behave correctly and validate inputs", () => {
            let b = 0x00;
            b = setBit(b, 1, true); // set bit 1 => 0x02
            expect(b).toBe(0x02);
            expect(getBit(b, 1)).toBe(true);
            expect(getBit(b, 0)).toBe(false);

            const cleared = clearBit(0xff, 7); // clear MSB -> 0x7f
            expect(cleared).toBe(0x7f);

            expect(() => setBit(0, -1, true)).toThrowError(
                /bitIndex must be in range 0-7/,
            );
            expect(() => getBit(0, 8)).toThrowError(
                /bitIndex must be in range 0-7/,
            );
            expect(() => clearBit(256, 0)).toThrowError(
                /value must fit in 1 bytes/,
            );
        });

        it("setByte returns single byte buffer and validates range", () => {
            const buf = setByte(200);
            expect(buf.byteLength).toBe(1);
            expect(buf.readUInt8(0)).toBe(200);
            expect(() => setByte(256)).toThrowError(
                /value must fit in 1 bytes/,
            );
            expect(() => setByte(-1)).toThrowError(/value must fit in 1 bytes/);
        });
    });

    describe("size check helpers", () => {
        it("checkSize2 and checkSize4 validate ranges", () => {
            expect(() => checkSize2(0xffff)).not.toThrow();
            expect(() => checkSize2(0x10000)).toThrowError(
                /value must fit in 2 bytes/,
            );

            expect(() => checkSize4(0xffffffff)).not.toThrow();
            expect(() => checkSize4(0x100000000)).toThrowError(
                /value must fit in 4 bytes/,
            );
        });
    });

    describe("buffer size helpers", () => {
        it("doesBufferFit throws when buffer too large", () => {
            expect(() => doesBufferFit(Buffer.alloc(5), 4)).toThrowError(
                /Input buffer too large/,
            );
            expect(() => doesBufferFit(Buffer.alloc(3), 4)).not.toThrow();
        });

        it("checkMinLength throws when buffer too small", () => {
            expect(() => checkMinLength(Buffer.alloc(1), 2)).toThrowError(
                /Not enough bytes/,
            );
            expect(() => checkMinLength(Buffer.alloc(4), 2)).not.toThrow();
        });
    });

    describe("diffObj", () => {
        it("detects no diff for identical objects", () => {
            const a = { x: 1, y: { z: 2 } };
            const res = diffObj(a, a);
            expect(res.isDataDiff).toBe(false);
            expect(res.diffs.length).toBe(0);
        });

        it("reports additions/removals when one side is missing", () => {
            const before = undefined;
            const after = { a: 1, b: 2 };
            const r = diffObj(before, after);
            expect(r.isDataDiff).toBe(true);
            expect(r.diffs.find((d: any) => d.name === "a")?.after).toBe(1);
            expect(r.diffs.length).toBe(2);
        });

        it("deep compares nested objects and reports changed keys", () => {
            const before = { nested: { a: 1 }, other: 5 };
            const after = { nested: { a: 2 }, other: 5 };
            const r = diffObj(before, after);
            expect(r.isDataDiff).toBe(true);
            expect(r.diffs.some((d: any) => d.name === "nested")).toBe(true);
            expect(r.diffs.some((d: any) => d.name === "other")).toBe(false);
        });

        it("reports scalar differences", () => {
            const before = { x: 1 };
            const after = { x: 2 };
            const r = diffObj(before, after);
            expect(r.isDataDiff).toBe(true);
            expect(r.diffs.length).toBe(1);
            expect(r.diffs[0]!.name).toBe("x");
            expect(r.diffs[0]!.before).toBe(1);
            expect(r.diffs[0]!.after).toBe(2);
        });

        it("returns no diff when comparing two objects with the same internal values", () => {
            const firstCString = new CString(5);
            firstCString.set("same");
            const SecondCString = new CString(5);
            SecondCString.set("same");

            expect(diffObj(firstCString, SecondCString)).toEqual({
                diffs: [],
                isDataDiff: false,
            });
        });

        it("returns no diff when comparing two nested objects with the same internal values", () => {
            const firstCString = new CString(5);
            firstCString.set("same");
            const SecondCString = new CString(5);
            SecondCString.set("same");

            expect(
                diffObj({ name: firstCString }, { name: SecondCString }),
            ).toEqual({
                diffs: [],
                isDataDiff: false,
            });
        });
    });

    describe("areBothObjectsAnInstanceOf", () => {
        it("correctly detects two types are the same", () => {
            const firstCString = new CString(5);
            const SecondCString = new CString(5);

            expect(
                areBothObjectsAnInstanceOf(
                    CString,
                    firstCString,
                    SecondCString,
                ),
            ).toBeTruthy();
        });
    });

    describe("shouldDeepDiff", () => {
        it("should correctly identify that a CString should not be deep diffed", () => {
            const cstringToDiff = new CString(6);

            expect(shouldDeepDiff(cstringToDiff)).toBeFalsy();
        });
    });
});
