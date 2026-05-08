import { describe, it, expect, beforeEach } from "vitest";
import {
    _extractCompletePackets,
    _mcotsPartialBuffers,
    clearPartialBuffer,
} from "../src/mcotsPortRouter.js";

/**
 * Build an MCOTS-framed packet around an opaque body. Layout matches
 * MessageNode.serialize: msgLength (u16 LE) + "TOMC" + sequence (i32 LE) +
 * flags (i8) + body.
 */
function frame(seq: number, flags: number, body: Buffer): Buffer {
    const buf = Buffer.alloc(11 + body.byteLength);
    buf.writeUInt16LE(9 + body.byteLength, 0); // msgLength
    buf.write("TOMC", 2, "utf8");
    buf.writeInt32LE(seq, 6);
    buf.writeInt8(flags, 10);
    body.copy(buf, 11);
    return buf;
}

describe("MCOTS reassembly: _extractCompletePackets", () => {
    beforeEach(() => {
        _mcotsPartialBuffers.clear();
    });

    it("emits a single complete packet that arrived in one chunk", () => {
        const pkt = frame(1, 0, Buffer.from([0x69, 0x00, 0xaa, 0xbb]));
        const { packets, resyncedBytes } = _extractCompletePackets("c1", pkt);
        expect(packets).toHaveLength(1);
        expect(packets[0]!.equals(pkt)).toBe(true);
        expect(resyncedBytes).toBe(0);
        expect(_mcotsPartialBuffers.has("c1")).toBe(false);
    });

    it("emits multiple coalesced packets in one chunk", () => {
        const a = frame(1, 0, Buffer.from([0x69, 0x00]));
        const b = frame(2, 0, Buffer.from([0x6c, 0x00, 0x01]));
        const c = frame(3, 8, Buffer.from([0xb2, 0x01, 0x02, 0x03, 0x04]));
        const merged = Buffer.concat([a, b, c]);

        const { packets, resyncedBytes } = _extractCompletePackets("c1", merged);
        expect(packets).toHaveLength(3);
        expect(packets[0]!.equals(a)).toBe(true);
        expect(packets[1]!.equals(b)).toBe(true);
        expect(packets[2]!.equals(c)).toBe(true);
        expect(resyncedBytes).toBe(0);
        expect(_mcotsPartialBuffers.has("c1")).toBe(false);
    });

    it("waits for the rest when a packet is split across two reads (the SERVER-M9 case)", () => {
        // This is the exact failure mode that desynced the cipher: TCP split
        // a single MCOTS packet across two `data` events. Old code extracted
        // a truncated body from chunk 1 and dropped chunk 2 entirely.
        const fullBody = Buffer.alloc(2000);
        for (let i = 0; i < fullBody.length; i++) {
            fullBody[i] = i & 0xff;
        }
        const fullPkt = frame(47, 8, fullBody);
        const splitAt = 1484;

        const chunk1 = fullPkt.subarray(0, splitAt);
        const chunk2 = fullPkt.subarray(splitAt);

        // Chunk 1: nothing complete yet.
        const r1 = _extractCompletePackets("c1", chunk1);
        expect(r1.packets).toHaveLength(0);
        expect(r1.resyncedBytes).toBe(0);
        expect(_mcotsPartialBuffers.get("c1")?.byteLength).toBe(splitAt);

        // Chunk 2: now we have the whole packet.
        const r2 = _extractCompletePackets("c1", chunk2);
        expect(r2.packets).toHaveLength(1);
        expect(r2.packets[0]!.equals(fullPkt)).toBe(true);
        expect(r2.resyncedBytes).toBe(0);
        expect(_mcotsPartialBuffers.has("c1")).toBe(false);
    });

    it("emits the first packet and retains the partial second across two reads", () => {
        const a = frame(1, 0, Buffer.from([0x69, 0x00]));
        const b = frame(2, 0, Buffer.alloc(20)); // 31-byte total
        const split = a.byteLength + 10;
        const chunk1 = Buffer.concat([a, b]).subarray(0, split);
        const chunk2 = Buffer.concat([a, b]).subarray(split);

        const r1 = _extractCompletePackets("c1", chunk1);
        expect(r1.packets).toHaveLength(1);
        expect(r1.packets[0]!.equals(a)).toBe(true);
        // Tail is the first 10 bytes of `b`.
        expect(_mcotsPartialBuffers.get("c1")?.byteLength).toBe(10);

        const r2 = _extractCompletePackets("c1", chunk2);
        expect(r2.packets).toHaveLength(1);
        expect(r2.packets[0]!.equals(b)).toBe(true);
        expect(_mcotsPartialBuffers.has("c1")).toBe(false);
    });

    it("isolates accumulator state per connection", () => {
        const a = frame(1, 0, Buffer.alloc(8));
        const splitAt = 7;
        _extractCompletePackets("c1", a.subarray(0, splitAt));
        _extractCompletePackets("c2", a); // c2 sees a complete packet

        expect(_mcotsPartialBuffers.get("c1")?.byteLength).toBe(splitAt);
        expect(_mcotsPartialBuffers.has("c2")).toBe(false);
    });

    it("resyncs past leading junk to the next valid TOMC frame", () => {
        const pkt = frame(1, 0, Buffer.from([0x69, 0x00, 0xaa]));
        const junk = Buffer.from("00deadbeef", "hex"); // 5 bytes, no TOMC
        const merged = Buffer.concat([junk, pkt]);

        const { packets, resyncedBytes } = _extractCompletePackets("c1", merged);
        expect(packets).toHaveLength(1);
        expect(packets[0]!.equals(pkt)).toBe(true);
        // 5 leading junk bytes were skipped to reach the candidate length
        // prefix that precedes "TOMC".
        expect(resyncedBytes).toBe(5);
    });

    it("drops bytes when no TOMC is present, keeping a small tail in case of split anchor", () => {
        // 20 bytes with no TOMC at all.
        const junk = Buffer.alloc(20);
        for (let i = 0; i < 20; i++) junk[i] = 0xee;

        const { packets, resyncedBytes } = _extractCompletePackets("c1", junk);
        expect(packets).toHaveLength(0);
        // Accumulator keeps last 3 bytes (in case TOMC straddles reads).
        expect(_mcotsPartialBuffers.get("c1")?.byteLength).toBe(3);
        expect(resyncedBytes).toBe(17);
    });

    it("rejects a packet whose msgLength is too small to be valid", () => {
        // Forge a buffer that has TOMC at offset 2 but msgLength = 5
        // (impossible: minimum is 9 = header without body).
        const bad = Buffer.alloc(20);
        bad.writeUInt16LE(5, 0);
        bad.write("TOMC", 2, "utf8");
        // Append a real packet after, so the resync recovers.
        const good = frame(1, 0, Buffer.from([0x69, 0x00]));
        const merged = Buffer.concat([bad, good]);

        const { packets, resyncedBytes } = _extractCompletePackets("c1", merged);
        // Should resync past the bogus framing and pick up the real packet.
        expect(packets).toHaveLength(1);
        expect(packets[0]!.equals(good)).toBe(true);
        expect(resyncedBytes).toBeGreaterThan(0);
    });

    it("clearPartialBuffer drops a connection's retained tail", () => {
        const partial = frame(1, 0, Buffer.alloc(50)).subarray(0, 30);
        _extractCompletePackets("c1", partial);
        expect(_mcotsPartialBuffers.has("c1")).toBe(true);

        clearPartialBuffer("c1");
        expect(_mcotsPartialBuffers.has("c1")).toBe(false);
    });

    it("does not loop forever on a TOMC at offset 0 of the buffer (no length prefix room)", () => {
        // TOMC at offset 0 — can't be the start of a valid packet because
        // there's no room for the 2-byte length prefix in front of it.
        // The extractor must drop bytes and not spin.
        const tomcThenJunk = Buffer.concat([
            Buffer.from("544f4d43", "hex"),
            Buffer.alloc(20, 0x00),
        ]);
        const { packets, resyncedBytes } = _extractCompletePackets(
            "c1",
            tomcThenJunk,
        );
        expect(packets).toHaveLength(0);
        // All but the tail-keeping bytes should be flagged as resynced.
        expect(resyncedBytes).toBeGreaterThan(0);
    });
});
