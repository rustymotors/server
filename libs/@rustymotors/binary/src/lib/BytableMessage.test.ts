import { describe, it, expect } from "vitest";
import { BytableMessage } from "./BytableMessage.js";

// Wire-format snapshots for BytableMessage (NPS protocol).
// v0 = 4-byte header [id:2 BE][length:2 BE]
// v1 = 12-byte header [id:2][length:2][0x0101:2][reserved:2][checksum:4]
// These hex strings lock in the exact on-the-wire bytes.

describe("BytableMessage v0 wire snapshots", () => {
    it("id=0x0217 data=[01 02 03] produces fixed hex", () => {
        const msg = new BytableMessage(0);
        msg.header.setId(0x0217);
        msg.setFieldValueByName("data", Buffer.from([0x01, 0x02, 0x03]));
        // Wire layout (7 bytes):
        //   [02 17]      id as UInt16BE
        //   [00 07]      length=7 (4 header + 3 payload) as UInt16BE
        //   [01 02 03]   payload
        expect(msg.serialize().toString("hex")).toBe("02170007010203");
    });

    it("empty payload produces 4-byte header-only wire", () => {
        const msg = new BytableMessage(0);
        msg.header.setId(0x0101);
        // Wire layout (4 bytes):
        //   [01 01]   id
        //   [00 04]   length=4
        expect(msg.serialize().toString("hex")).toBe("01010004");
    });

    it("round-trips through deserialize with no data loss", () => {
        const original = "02170007010203";
        const msg = new BytableMessage(0);
        msg.deserialize(Buffer.from(original, "hex"));
        expect(msg.serialize().toString("hex")).toBe(original);
    });
});

describe("BytableMessage v1 wire snapshots", () => {
    it("id=0x0217 data=[01 02 03] produces fixed hex", () => {
        const msg = new BytableMessage(1);
        msg.header.setId(0x0217);
        msg.setFieldValueByName("data", Buffer.from([0x01, 0x02, 0x03]));
        // Wire layout (15 bytes):
        //   [02 17]         id as UInt16BE
        //   [00 0f]         length=15 (12 header + 3 payload) as UInt16BE
        //   [01 01]         version=257
        //   [00 00]         reserved=0
        //   [00 00 00 00]   checksum=0 (BytableHeader default; not auto-computed)
        //   [01 02 03]      payload
        expect(msg.serialize().toString("hex")).toBe("0217000f0101000000000000010203");
    });

    it("round-trips through deserialize with no data loss", () => {
        // Note: checksum field in BytableHeader is not validated on deserialize (unlike GamePacket).
        // v1 is identified by bytes 4-5 === 0x0101.
        const original = "0217000f0101000000000000010203";
        const msg = new BytableMessage(1);
        msg.deserialize(Buffer.from(original, "hex"));
        expect(msg.serialize().toString("hex")).toBe(original);
    });
});

describe("BytableMessage.FromRawMessage", () => {
    it("wraps a raw buffer as v0 BytableMessage with matching hex", () => {
        const raw = { serialize: () => Buffer.from("01000004", "hex") };
        const msg = BytableMessage.FromRawMessage(raw);
        expect(msg.serialize().toString("hex")).toBe("01000004");
    });
});
