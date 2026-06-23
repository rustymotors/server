import { describe, it, expect, beforeEach } from "vitest";
import { NpsRiffInfo, NpsRiffListMessage } from "./NpsRiffInfo.js";

// Captured from live serialization of the values used in handleSendRiffList.
// Format string: "pllpssssbsslc" (verified from Ghidra NPS_Pack::pack at 0xbc3a00)
const RIFF_INFO_HEX =
    "00000005726163650000000021002c0079000000010000020005000a0000" +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "000300080000001504";

// Full NPS_RIFF_LIST packet (opcode 0x0401), one riff entry.
// Header: [0401][0133] = opcode 0x0401, total length 307
// List header: [00000000][00000001] = structSize=0, numRiffs=1
const RIFF_LIST_MSG_HEX =
    "04010133" +
    "0000000000000001" +
    RIFF_INFO_HEX;

function makeRiff(): NpsRiffInfo {
    const riff = new NpsRiffInfo();
    riff.riffName = "race";
    riff.protocol = 33;
    riff.commId = 2883705; // 0x002C0079
    riff.password = "";
    riff.channelType = 2;
    riff.connectedUsers = 5;
    riff.openChannels = 10;
    riff.userIsConnected = false;
    riff.channelData = Buffer.alloc(256, 0x00);
    riff.numReadyPlayers = 3;
    riff.maxReadyPlayers = 8;
    riff.channelOwnerId = 21;
    riff.gameServerIsRunning = 4;
    return riff;
}

describe("NpsRiffInfo", () => {
    describe("serializeSize", () => {
        it("should be 295 bytes for a single riff entry", () => {
            expect(makeRiff().serializeSize).toBe(295);
        });

        it("should grow when riffName is longer", () => {
            const riff = new NpsRiffInfo();
            riff.riffName = "alongername"; // 11 chars vs 4
            expect(riff.serializeSize).toBe(295 - 4 + 11); // 302
        });
    });

    describe("serialize()", () => {
        it("should produce the correct wire bytes", () => {
            expect(makeRiff().serialize().toString("hex")).toBe(RIFF_INFO_HEX);
        });

        it("should encode riffName as NPS_Pack 'p': 4-byte BE (strlen+1) then string+null", () => {
            const bytes = makeRiff().serialize();
            // prefix = strlen("race") + 1 = 5
            expect(bytes.readUInt32BE(0)).toBe(5);
            // string bytes: "race"
            expect(bytes.subarray(4, 8).toString("ascii")).toBe("race");
            // null terminator
            expect(bytes[8]).toBe(0);
        });

        it("should encode protocol as NPS_Pack 'l': 4-byte BE uint32", () => {
            const bytes = makeRiff().serialize();
            expect(bytes.readUInt32BE(9)).toBe(33);
        });

        it("should encode commId as NPS_Pack 'l': 4-byte BE", () => {
            const bytes = makeRiff().serialize();
            expect(bytes.readInt32BE(13)).toBe(2883705);
        });

        it("should encode empty password as NPS_Pack 'p': prefix=1 then null byte", () => {
            const bytes = makeRiff().serialize();
            // password starts at offset 17
            expect(bytes.readUInt32BE(17)).toBe(1); // strlen("") + 1 = 1
            expect(bytes[21]).toBe(0);              // null terminator only
        });

        it("should encode channelData as NPS_Pack 'b': exactly 256 raw bytes with no prefix", () => {
            const bytes = makeRiff().serialize();
            const channelData = bytes.subarray(30, 286);
            expect(channelData.length).toBe(256);
            expect(channelData.every((b) => b === 0)).toBe(true);
        });

        it("should encode trailing shorts and uint32 correctly", () => {
            const bytes = makeRiff().serialize();
            expect(bytes.readUInt16BE(286)).toBe(3);  // numReadyPlayers
            expect(bytes.readUInt16BE(288)).toBe(8);  // maxReadyPlayers
            expect(bytes.readUInt32BE(290)).toBe(21); // channelOwnerId
            expect(bytes[294]).toBe(4);               // gameServerIsRunning
        });
    });
});

describe("NpsRiffListMessage", () => {
    describe("serialize()", () => {
        it("should produce the correct full wire packet", () => {
            const msg = new NpsRiffListMessage();
            msg.id = 0x0401;
            msg.addRiff(makeRiff());
            expect(msg.serialize().toString("hex")).toBe(RIFF_LIST_MSG_HEX);
        });

        it("should have opcode 0x0401 in the header", () => {
            const msg = new NpsRiffListMessage();
            msg.id = 0x0401;
            msg.addRiff(makeRiff());
            const bytes = msg.serialize();
            expect(bytes.readUInt16BE(0)).toBe(0x0401);
        });

        it("should encode total length correctly in the header", () => {
            const msg = new NpsRiffListMessage();
            msg.id = 0x0401;
            msg.addRiff(makeRiff());
            const bytes = msg.serialize();
            // 4 (header) + 8 (list header) + 295 (one riff) = 307 = 0x133
            expect(bytes.readUInt16BE(2)).toBe(307);
        });

        it("should encode numRiffs correctly in the list header", () => {
            const msg = new NpsRiffListMessage();
            msg.id = 0x0401;
            msg.addRiff(makeRiff());
            const bytes = msg.serialize();
            // list header starts at byte 4: [structSize:4][numRiffs:4]
            expect(bytes.readUInt32BE(8)).toBe(1);
        });

        it("should scale correctly with two riff entries", () => {
            const msg = new NpsRiffListMessage();
            msg.id = 0x0401;
            msg.addRiff(makeRiff());
            msg.addRiff(makeRiff());
            const bytes = msg.serialize();
            // 4 + 8 + 295 * 2 = 602
            expect(bytes.length).toBe(602);
            expect(bytes.readUInt32BE(8)).toBe(2); // numRiffs
        });
    });
});
