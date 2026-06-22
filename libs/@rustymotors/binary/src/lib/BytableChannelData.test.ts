import { describe, it, expect } from "vitest";
import { BytableChannelData } from "./BytableBuffer.js";

function make(): BytableChannelData {
    return new BytableChannelData();
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function setAllFields(cd: BytableChannelData): void {
    cd.raceID = 7;
    cd.raceName = "nightcruise";
    cd.entryFee = 500;
    cd.purseBonusPerPlayer = 100;
    cd.purseBonusPerRace = 50;
    cd.maxNPSracers = 6;
    cd.minNPSracers = 2;
    cd.numRounds = 3;
    cd.numLaps = 4;
    cd.backwardRace = true;
    cd.mirrored = false;
    cd.nightDriving = true;
    cd.weatherDriving = false;
    cd.damageMode = 1;
    cd.traffic = true;
    cd.handicapped = false;
    cd.mode = 2; // RM_CLUB
    cd.sponsorBPT = 9999;
    cd.minlevel = 5;
    cd.maxlevel = 20;
    cd.requiredBodyClass = 1;
    cd.maxPowerClass = 3;
    cd.bDisallowNOS = true;
    cd.raceInProgress = true;
    cd.connectedPlayers = 4;
    cd.hostID = 88888;
    cd.hostName = "SpeedDemon";
    cd.setUserID(0, 1001);
    cd.setUserID(1, 1002);
    cd.setUserID(2, 1003);
    cd.setDbCarID(0, 201);
    cd.setDbCarID(1, 202);
    cd.setDbBptID(0, 301);
    cd.setDbBptID(1, 302);
    cd.majorVersionNum = 1;
    cd.minorVersionNum = 2;
    cd.revisionVersionNum = 3;
}

// ---------------------------------------------------------------------------
// serializeSize
// ---------------------------------------------------------------------------

describe("BytableChannelData", () => {
    describe("serializeSize", () => {
        it("is always 256", () => {
            expect(make().serializeSize).toBe(256);
        });

        it("is 256 after setting fields", () => {
            const cd = make();
            setAllFields(cd);
            expect(cd.serializeSize).toBe(256);
        });
    });

    // -----------------------------------------------------------------------
    // default serialize (all zeros)
    // -----------------------------------------------------------------------

    describe("serialize() — default", () => {
        it("produces exactly 256 bytes", () => {
            expect(make().serialize().length).toBe(256);
        });

        it("is all zeros when no fields are set", () => {
            const buf = make().serialize();
            expect(buf.every((b) => b === 0)).toBe(true);
        });
    });

    // -----------------------------------------------------------------------
    // integer fields at fixed offsets
    // -----------------------------------------------------------------------

    describe("raceID — int32 LE at offset 0", () => {
        it("serializes correctly", () => {
            const cd = make();
            cd.raceID = 0x01020304;
            expect(cd.serialize().readInt32LE(0)).toBe(0x01020304);
        });

        it("round-trips", () => {
            const cd = make();
            cd.raceID = 12345;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.raceID).toBe(12345);
        });
    });

    describe("raceName — char[64] at offset 4", () => {
        it("serializes a short name", () => {
            const cd = make();
            cd.raceName = "pit1";
            const buf = cd.serialize();
            expect(buf.subarray(4, 8).toString("utf8")).toBe("pit1");
            expect(buf[8]).toBe(0); // null-terminated
        });

        it("leaves the field zero-padded to 64 bytes", () => {
            const cd = make();
            cd.raceName = "hi";
            const buf = cd.serialize();
            expect(buf.subarray(6, 68).every((b) => b === 0)).toBe(true);
        });

        it("throws if name exceeds 63 chars (NPS_GAMENAME_LEN - 1)", () => {
            const cd = make();
            expect(() => { cd.raceName = "x".repeat(100); }).toThrow();
        });

        it("does not overwrite entryFee at offset 68", () => {
            const cd = make();
            cd.raceName = "x".repeat(63);
            cd.entryFee = 42;
            expect(cd.serialize().readInt32LE(68)).toBe(42);
        });

        it("round-trips", () => {
            const cd = make();
            cd.raceName = "NightStrip";
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.raceName).toBe("NightStrip");
        });
    });

    describe("entryFee / purseBonusPerPlayer / purseBonusPerRace — int32 LE at 68/72/76", () => {
        it("serializes at correct offsets", () => {
            const cd = make();
            cd.entryFee = 1000;
            cd.purseBonusPerPlayer = 200;
            cd.purseBonusPerRace = 50;
            const buf = cd.serialize();
            expect(buf.readInt32LE(68)).toBe(1000);
            expect(buf.readInt32LE(72)).toBe(200);
            expect(buf.readInt32LE(76)).toBe(50);
        });

        it("round-trips all three", () => {
            const cd = make();
            cd.entryFee = 999;
            cd.purseBonusPerPlayer = 111;
            cd.purseBonusPerRace = 222;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.entryFee).toBe(999);
            expect(cd2.purseBonusPerPlayer).toBe(111);
            expect(cd2.purseBonusPerRace).toBe(222);
        });
    });

    // -----------------------------------------------------------------------
    // bitfield byte 80: maxNPSracers:4 | minNPSracers:4<<4
    // -----------------------------------------------------------------------

    describe("maxNPSracers / minNPSracers — nibbles at offset 80", () => {
        it("packs maxNPSracers into low nibble", () => {
            const cd = make();
            cd.maxNPSracers = 6;
            cd.minNPSracers = 0;
            expect(cd.serialize()[80]).toBe(0x06);
        });

        it("packs minNPSracers into high nibble", () => {
            const cd = make();
            cd.maxNPSracers = 0;
            cd.minNPSracers = 2;
            expect(cd.serialize()[80]).toBe(0x20);
        });

        it("packs both nibbles together", () => {
            const cd = make();
            cd.maxNPSracers = 6;
            cd.minNPSracers = 2;
            expect(cd.serialize()[80]).toBe(0x26);
        });

        it("masks values to 4 bits", () => {
            const cd = make();
            cd.maxNPSracers = 0x1f; // only low 4 bits kept
            expect(cd.maxNPSracers).toBe(0x0f);
        });

        it("round-trips", () => {
            const cd = make();
            cd.maxNPSracers = 8;
            cd.minNPSracers = 3;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.maxNPSracers).toBe(8);
            expect(cd2.minNPSracers).toBe(3);
        });
    });

    // -----------------------------------------------------------------------
    // bitfield byte 81: numRounds:4 | numLaps:4<<4
    // -----------------------------------------------------------------------

    describe("numRounds / numLaps — nibbles at offset 81", () => {
        it("packs numRounds into low nibble and numLaps into high nibble", () => {
            const cd = make();
            cd.numRounds = 3;
            cd.numLaps = 5;
            expect(cd.serialize()[81]).toBe(0x53);
        });

        it("round-trips", () => {
            const cd = make();
            cd.numRounds = 2;
            cd.numLaps = 8;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.numRounds).toBe(2);
            expect(cd2.numLaps).toBe(8);
        });
    });

    // -----------------------------------------------------------------------
    // bitfield byte 82: race flags
    // -----------------------------------------------------------------------

    describe("race flags — bitfield byte at offset 82", () => {
        it("backwardRace is bit 0", () => {
            const cd = make();
            cd.backwardRace = true;
            expect(cd.serialize()[82]! & 0x01).toBe(1);
        });

        it("mirrored is bit 1", () => {
            const cd = make();
            cd.mirrored = true;
            expect(cd.serialize()[82]! & 0x02).toBe(2);
        });

        it("nightDriving is bit 2", () => {
            const cd = make();
            cd.nightDriving = true;
            expect(cd.serialize()[82]! & 0x04).toBe(4);
        });

        it("weatherDriving is bit 3", () => {
            const cd = make();
            cd.weatherDriving = true;
            expect(cd.serialize()[82]! & 0x08).toBe(8);
        });

        it("damageMode occupies bits 4-5", () => {
            const cd = make();
            cd.damageMode = 2;
            expect((cd.serialize()[82]! >> 4) & 0x03).toBe(2);
        });

        it("traffic is bit 6", () => {
            const cd = make();
            cd.traffic = true;
            expect(cd.serialize()[82]! & 0x40).toBe(0x40);
        });

        it("handicapped is bit 7", () => {
            const cd = make();
            cd.handicapped = true;
            expect(cd.serialize()[82]! & 0x80).toBe(0x80);
        });

        it("all flags set produces 0xff (damageMode=3)", () => {
            const cd = make();
            cd.backwardRace = true;
            cd.mirrored = true;
            cd.nightDriving = true;
            cd.weatherDriving = true;
            cd.damageMode = 3;
            cd.traffic = true;
            cd.handicapped = true;
            expect(cd.serialize()[82]!).toBe(0xff);
        });

        it("damageMode is masked to 2 bits", () => {
            const cd = make();
            cd.damageMode = 0x07; // only low 2 bits kept
            expect(cd.damageMode).toBe(3);
        });

        it("round-trips all flags", () => {
            const cd = make();
            cd.backwardRace = true;
            cd.mirrored = true;
            cd.nightDriving = false;
            cd.weatherDriving = true;
            cd.damageMode = 2;
            cd.traffic = false;
            cd.handicapped = true;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.backwardRace).toBe(true);
            expect(cd2.mirrored).toBe(true);
            expect(cd2.nightDriving).toBe(false);
            expect(cd2.weatherDriving).toBe(true);
            expect(cd2.damageMode).toBe(2);
            expect(cd2.traffic).toBe(false);
            expect(cd2.handicapped).toBe(true);
        });
    });

    // -----------------------------------------------------------------------
    // alignment padding at offset 83
    // -----------------------------------------------------------------------

    describe("alignment padding at offset 83", () => {
        it("byte 83 is always zero", () => {
            const cd = make();
            setAllFields(cd);
            expect(cd.serialize()[83]).toBe(0);
        });
    });

    // -----------------------------------------------------------------------
    // mode / sponsorBPT / level bytes (offsets 84-95)
    // -----------------------------------------------------------------------

    describe("mode — int32 LE at offset 84", () => {
        it("serializes at offset 84", () => {
            const cd = make();
            cd.mode = 3; // RM_PINKSLIP
            expect(cd.serialize().readInt32LE(84)).toBe(3);
        });

        it("round-trips", () => {
            const cd = make();
            cd.mode = 2;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.mode).toBe(2);
        });
    });

    describe("sponsorBPT — uint32 LE at offset 88", () => {
        it("serializes correctly", () => {
            const cd = make();
            cd.sponsorBPT = 0xdeadbeef;
            expect(cd.serialize().readUInt32LE(88)).toBe(0xdeadbeef);
        });
    });

    describe("level / class bytes at offsets 92-95", () => {
        it("minlevel is at offset 92", () => {
            const cd = make();
            cd.minlevel = 5;
            expect(cd.serialize()[92]).toBe(5);
        });

        it("maxlevel is at offset 93", () => {
            const cd = make();
            cd.maxlevel = 20;
            expect(cd.serialize()[93]).toBe(20);
        });

        it("requiredBodyClass is at offset 94", () => {
            const cd = make();
            cd.requiredBodyClass = 1;
            expect(cd.serialize()[94]).toBe(1);
        });

        it("maxPowerClass is at offset 95", () => {
            const cd = make();
            cd.maxPowerClass = 3;
            expect(cd.serialize()[95]).toBe(3);
        });
    });

    // -----------------------------------------------------------------------
    // bDisallowNOS — BOOL bitfield occupying 4-byte int at offset 96
    // -----------------------------------------------------------------------

    describe("bDisallowNOS — BOOL bitfield, 4-byte int at offset 96", () => {
        it("true writes 1 as int32 LE", () => {
            const cd = make();
            cd.bDisallowNOS = true;
            expect(cd.serialize().readInt32LE(96)).toBe(1);
        });

        it("false writes 0", () => {
            const cd = make();
            cd.bDisallowNOS = false;
            expect(cd.serialize().readInt32LE(96)).toBe(0);
        });

        it("occupies exactly 4 bytes (bytes 96-99)", () => {
            const cd = make();
            cd.bDisallowNOS = true;
            const buf = cd.serialize();
            expect(buf[96]).toBe(1);
            expect(buf[97]).toBe(0);
            expect(buf[98]).toBe(0);
            expect(buf[99]).toBe(0);
        });

        it("round-trips", () => {
            const cd = make();
            cd.bDisallowNOS = true;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.bDisallowNOS).toBe(true);
        });
    });

    // -----------------------------------------------------------------------
    // raceInProgress / connectedPlayers — char bitfield at offset 100
    // -----------------------------------------------------------------------

    describe("raceInProgress / connectedPlayers — char bitfield at offset 100", () => {
        it("raceInProgress is bit 0", () => {
            const cd = make();
            cd.raceInProgress = true;
            cd.connectedPlayers = 0;
            expect(cd.serialize()[100]).toBe(0x01);
        });

        it("connectedPlayers occupies bits 1-4", () => {
            const cd = make();
            cd.raceInProgress = false;
            cd.connectedPlayers = 4;
            expect(cd.serialize()[100]).toBe(4 << 1);
        });

        it("both fields packed into one byte", () => {
            const cd = make();
            cd.raceInProgress = true;
            cd.connectedPlayers = 5;
            // raceInProgress=1 (bit0) | connectedPlayers=5 (bits 1-4) → 0x01 | (5<<1)=0x0b
            expect(cd.serialize()[100]).toBe(0x0b);
        });

        it("connectedPlayers is masked to 4 bits", () => {
            const cd = make();
            cd.connectedPlayers = 0x1f; // only low 4 bits kept
            expect(cd.connectedPlayers).toBe(0x0f);
        });

        it("alignment padding bytes 101-103 are zero", () => {
            const cd = make();
            cd.raceInProgress = true;
            cd.connectedPlayers = 15;
            const buf = cd.serialize();
            expect(buf[101]).toBe(0);
            expect(buf[102]).toBe(0);
            expect(buf[103]).toBe(0);
        });

        it("round-trips", () => {
            const cd = make();
            cd.raceInProgress = true;
            cd.connectedPlayers = 7;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.raceInProgress).toBe(true);
            expect(cd2.connectedPlayers).toBe(7);
        });
    });

    // -----------------------------------------------------------------------
    // hostID / hostName (offsets 104 / 108)
    // -----------------------------------------------------------------------

    describe("hostID — uint32 LE at offset 104", () => {
        it("serializes at offset 104", () => {
            const cd = make();
            cd.hostID = 0x0001e240; // 123456
            expect(cd.serialize().readUInt32LE(104)).toBe(123456);
        });

        it("round-trips", () => {
            const cd = make();
            cd.hostID = 77777;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.hostID).toBe(77777);
        });
    });

    describe("hostName — char[30] at offset 108", () => {
        it("serializes at offset 108", () => {
            const cd = make();
            cd.hostName = "Molly";
            const buf = cd.serialize();
            expect(buf.subarray(108, 113).toString("utf8")).toBe("Molly");
            expect(buf[113]).toBe(0);
        });

        it("throws if name exceeds 29 chars (kMAX_PLAYER_NAME - 1)", () => {
            const cd = make();
            expect(() => { cd.hostName = "x".repeat(50); }).toThrow();
        });

        it("alignment padding bytes 138-139 are zero", () => {
            const cd = make();
            cd.hostName = "x".repeat(29);
            const buf = cd.serialize();
            expect(buf[138]).toBe(0);
            expect(buf[139]).toBe(0);
        });

        it("round-trips", () => {
            const cd = make();
            cd.hostName = "SpeedDemon";
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.hostName).toBe("SpeedDemon");
        });
    });

    // -----------------------------------------------------------------------
    // userID[6] / dbCarID[6] / dbBptID[6] (offsets 140 / 164 / 188)
    // -----------------------------------------------------------------------

    describe("userID[6] — uint32[6] LE at offset 140", () => {
        it("serializes all six slots", () => {
            const cd = make();
            for (let i = 0; i < 6; i++) cd.setUserID(i, (i + 1) * 10);
            const buf = cd.serialize();
            for (let i = 0; i < 6; i++) {
                expect(buf.readUInt32LE(140 + i * 4)).toBe((i + 1) * 10);
            }
        });

        it("round-trips", () => {
            const cd = make();
            cd.setUserID(0, 9001);
            cd.setUserID(5, 9006);
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.getUserID(0)).toBe(9001);
            expect(cd2.getUserID(5)).toBe(9006);
        });
    });

    describe("dbCarID[6] — int32[6] LE at offset 164", () => {
        it("serializes all six slots", () => {
            const cd = make();
            for (let i = 0; i < 6; i++) cd.setDbCarID(i, 100 + i);
            const buf = cd.serialize();
            for (let i = 0; i < 6; i++) {
                expect(buf.readInt32LE(164 + i * 4)).toBe(100 + i);
            }
        });

        it("round-trips", () => {
            const cd = make();
            cd.setDbCarID(2, 777);
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.getDbCarID(2)).toBe(777);
        });
    });

    describe("dbBptID[6] — int32[6] LE at offset 188", () => {
        it("serializes all six slots", () => {
            const cd = make();
            for (let i = 0; i < 6; i++) cd.setDbBptID(i, 200 + i);
            const buf = cd.serialize();
            for (let i = 0; i < 6; i++) {
                expect(buf.readInt32LE(188 + i * 4)).toBe(200 + i);
            }
        });

        it("round-trips", () => {
            const cd = make();
            cd.setDbBptID(4, 888);
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.getDbBptID(4)).toBe(888);
        });
    });

    // -----------------------------------------------------------------------
    // version fields (offsets 212 / 216 / 220)
    // -----------------------------------------------------------------------

    describe("version fields — uint32 LE at 212/216/220", () => {
        it("serializes at correct offsets", () => {
            const cd = make();
            cd.majorVersionNum = 1;
            cd.minorVersionNum = 2;
            cd.revisionVersionNum = 3;
            const buf = cd.serialize();
            expect(buf.readUInt32LE(212)).toBe(1);
            expect(buf.readUInt32LE(216)).toBe(2);
            expect(buf.readUInt32LE(220)).toBe(3);
        });

        it("round-trips all three", () => {
            const cd = make();
            cd.majorVersionNum = 4;
            cd.minorVersionNum = 5;
            cd.revisionVersionNum = 6;
            const cd2 = make();
            cd2.deserialize(cd.serialize());
            expect(cd2.majorVersionNum).toBe(4);
            expect(cd2.minorVersionNum).toBe(5);
            expect(cd2.revisionVersionNum).toBe(6);
        });
    });

    // -----------------------------------------------------------------------
    // struct ends at 224, bytes 224-255 are always zero
    // -----------------------------------------------------------------------

    describe("trailing padding (bytes 224-255)", () => {
        it("bytes 224-255 are zero after serializing all fields", () => {
            const cd = make();
            setAllFields(cd);
            const buf = cd.serialize();
            expect(buf.subarray(224).every((b) => b === 0)).toBe(true);
        });
    });

    // -----------------------------------------------------------------------
    // full round-trip with all fields populated
    // -----------------------------------------------------------------------

    describe("full round-trip", () => {
        it("all fields survive serialize → deserialize", () => {
            const cd = make();
            setAllFields(cd);

            const cd2 = make();
            cd2.deserialize(cd.serialize());

            expect(cd2.raceID).toBe(7);
            expect(cd2.raceName).toBe("nightcruise");
            expect(cd2.entryFee).toBe(500);
            expect(cd2.purseBonusPerPlayer).toBe(100);
            expect(cd2.purseBonusPerRace).toBe(50);
            expect(cd2.maxNPSracers).toBe(6);
            expect(cd2.minNPSracers).toBe(2);
            expect(cd2.numRounds).toBe(3);
            expect(cd2.numLaps).toBe(4);
            expect(cd2.backwardRace).toBe(true);
            expect(cd2.mirrored).toBe(false);
            expect(cd2.nightDriving).toBe(true);
            expect(cd2.weatherDriving).toBe(false);
            expect(cd2.damageMode).toBe(1);
            expect(cd2.traffic).toBe(true);
            expect(cd2.handicapped).toBe(false);
            expect(cd2.mode).toBe(2);
            expect(cd2.sponsorBPT).toBe(9999);
            expect(cd2.minlevel).toBe(5);
            expect(cd2.maxlevel).toBe(20);
            expect(cd2.requiredBodyClass).toBe(1);
            expect(cd2.maxPowerClass).toBe(3);
            expect(cd2.bDisallowNOS).toBe(true);
            expect(cd2.raceInProgress).toBe(true);
            expect(cd2.connectedPlayers).toBe(4);
            expect(cd2.hostID).toBe(88888);
            expect(cd2.hostName).toBe("SpeedDemon");
            expect(cd2.getUserID(0)).toBe(1001);
            expect(cd2.getUserID(1)).toBe(1002);
            expect(cd2.getUserID(2)).toBe(1003);
            expect(cd2.getDbCarID(0)).toBe(201);
            expect(cd2.getDbCarID(1)).toBe(202);
            expect(cd2.getDbBptID(0)).toBe(301);
            expect(cd2.getDbBptID(1)).toBe(302);
            expect(cd2.majorVersionNum).toBe(1);
            expect(cd2.minorVersionNum).toBe(2);
            expect(cd2.revisionVersionNum).toBe(3);
        });

        it("serialize is idempotent", () => {
            const cd = make();
            setAllFields(cd);
            const buf1 = cd.serialize();
            const buf2 = cd.serialize();
            expect(buf1.toString("hex")).toBe(buf2.toString("hex"));
        });
    });

    // -----------------------------------------------------------------------
    // live packet
    // -----------------------------------------------------------------------

    describe("live packet", () => {
        const HEX =
            "58000000726163650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000003001111040000000000000000000000000001000000000000001500000044722042726f776e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000007500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

        it("deserializes without throwing", () => {
            const cd = make();
            expect(() => cd.deserialize(Buffer.from(HEX, "hex"))).not.toThrow();
        });

        it("parses raceID correctly", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.raceID).toBe(88);
        });

        it("parses raceName correctly", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.raceName).toBe("race");
        });

        it("parses purseBonusPerPlayer correctly", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.purseBonusPerPlayer).toBe(20);
        });

        it("parses nibble fields correctly (maxNPSracers=1, minNPSracers=1, numRounds=1, numLaps=1)", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.maxNPSracers).toBe(1);
            expect(cd.minNPSracers).toBe(1);
            expect(cd.numRounds).toBe(1);
            expect(cd.numLaps).toBe(1);
        });

        it("parses all race flags correctly", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.backwardRace).toBe(false);
            expect(cd.mirrored).toBe(false);
            expect(cd.nightDriving).toBe(true);
            expect(cd.weatherDriving).toBe(false);
            expect(cd.damageMode).toBe(0);
            expect(cd.traffic).toBe(false);
            expect(cd.handicapped).toBe(false);
        });

        it("parses bDisallowNOS correctly", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.bDisallowNOS).toBe(true);
        });

        it("parses hostID correctly", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.hostID).toBe(21);
        });

        it("parses hostName correctly", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.hostName).toBe("Dr Brown");
        });

        it("round-trips: serialize output matches original packet", () => {
            const cd = make();
            cd.deserialize(Buffer.from(HEX, "hex"));
            expect(cd.serialize().toString("hex")).toBe(HEX);
        });
    });

    // -----------------------------------------------------------------------
    // BytableObject interface
    // -----------------------------------------------------------------------

    describe("BytableObject interface", () => {
        it("name defaults to 'channelData'", () => {
            expect(make().name).toBe("channelData");
        });

        it("setName changes the name", () => {
            const cd = make();
            cd.setName("myChannel");
            expect(cd.name).toBe("myChannel");
        });

        it("value returns the serialized buffer", () => {
            const cd = make();
            cd.raceID = 1;
            expect(cd.value.readInt32LE(0)).toBe(1);
        });

        it("setValue throws", () => {
            expect(() => make().setValue(Buffer.alloc(256))).toThrow();
        });

        it("json includes name and serializeSize", () => {
            const j = make().json;
            expect(j.name).toBe("channelData");
            expect(j.serializeSize).toBe(256);
        });
    });
});
