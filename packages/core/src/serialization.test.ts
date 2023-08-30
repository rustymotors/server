import { describe, it, expect } from "vitest";
import {
    Header,
} from "./serialization.js";

describe("serialization", () => {
    describe("Header", () => {
        it("should allow passing in values to constructor", () => {
            const values = {
                messageCode: 12279,
                messageLength: 0,
                messageVersion: 0,
                messageChecksum: 5,
            };

            const header = new Header(values);
            expect(header.messageCode).toEqual(values.messageCode);
            expect(header.messageLength).toEqual(values.messageLength);
            expect(header.messageVersion).toEqual(values.messageVersion);
            expect(header.messageChecksum).toEqual(values.messageChecksum);
        });

        it("should have a default constructor", () => {
            const header = new Header();
            expect(header.messageCode).toEqual(0);
            expect(header.messageLength).toEqual(0);
            expect(header.messageVersion).toEqual(0);
            expect(header.messageChecksum).toEqual(0);
        });

        it("should serialize", () => {
            const header = new Header({
                messageCode: 1281,
                messageLength: 318,
                messageVersion: 257,
                messageChecksum: 318,
            });

            const expected = Buffer.from([
                0x05, 0x01,

                0x01, 0x3e,

                0x01, 0x01,

                0x00, 0x00,

                0x00, 0x00, 0x01, 0x3e,
            ]);

            const buf = header.serialize();
            expect(buf).toEqual(expected);
        });
    });
});
