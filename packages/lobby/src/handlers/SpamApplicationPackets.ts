/**
 * Parsers for the application-layer packets that ride inside NPS relay
 * blobs (i.e., the bytes after the 16-byte NpsRelaySingleMessage envelope).
 *
 * These are *peer-to-peer* messages between game clients; the server is
 * normally just a relay and need not parse them. Parsing is useful for
 * structured logging, anti-cheat heuristics, and eventually for any
 * server-side simulation work.
 *
 * Source structures (all #pragma pack(1), little-endian on the wire):
 *   tPositionPkt        — MCity/Game/Security.h:114
 *   tCarData_Zipped     — MCity/Game/Security.h:102
 *   tRacerFinishedPkt   — MCity/Game/SPAM.c:71
 *   tScorePkt           — MCity/Game/SPAM.c:63
 *
 * The first byte of every relay blob is the application packet-type index,
 * dispatched by the client at MCity_d.exe!0x011a6a50. See
 * NpsRelayApplicationPacketType in NpsRelaySingleMessage.ts for the full
 * list.
 *
 * TODO(spam-festats-parser): no parser yet for SPAM_SYNC_FINAL_STATS (type 6).
 *   The payload is a 360-byte FeStats_Obj struct (MCity/Frontend/festats.h:44)
 *   carrying nested Car_tStats, GameSetup_tCarData* (host-only pointer that
 *   should be ignored on wire), and FeStats_tReportedInfo (place, raceTime,
 *   bestLapTime, topSpeed, avgSpeed, cashWon, racePoints, totalPoints,
 *   pointsToNextLevel, pointsToNextRank, old/new player level + rank,
 *   partPrizeBPT, awardedAbstractPartName, awardedFullPartName,
 *   partPrizeStarRating, teamCashBonus, teamPointBonus, teamCombinedPar).
 *   Note this is *peer broadcast* of stats — the server-authoritative copy
 *   arrives over MCOTS as MC_RACE_RESULTS (CompletedRaceMessage).
 *
 * TODO(spam-big-packet-reassembly): SpamBigPacketHeader parses one
 *   fragment's header but there is no reassembler yet. The client receives
 *   N chunks (totalChunks) with the same channelId0/channelId1 pair and
 *   memcpys each chunk's payload into a 0x810-byte slot at
 *   `chunkIndex * 0xec` (236) — see PACKET_ReceiveBigPacket_CALLBACK at
 *   MCity_d.exe!0x00690920. When chunkIndex == totalChunks - 1 the slot is
 *   dispatched to the inner packet-type handler. To reassemble server-side,
 *   key the slot map by (channelId0, channelId1).
 */

/**
 * One car's compressed position frame inside a SPAM_POSITION packet.
 *
 * Wire layout (36 bytes, pack(1)):
 *   [0]      i8  carIndex                       slot (0..5) within the race
 *   [1..9]   tPosCoord pos                      bit-packed XYZ position
 *   [10..15] tVelCoord linearVel                bit-packed XYZ linear velocity
 *   [16..21] tVelCoord angularVel               bit-packed XYZ angular velocity
 *   [22..29] tQuat qOrient (4 × i16)           orientation as quaternion
 *                                               (each component 14.2 fixed-point)
 *   [30..31] i16 sliceTotal                     current track slice (lap segment)
 *   [32..35] tSPAMflags flags (32-bit bitfield)
 *
 * Bit-packed coordinate fields:
 *   tPosCoord: xW(15)+xNeg(1) | yW(15)+yNeg(1) | zW(15)+zNeg(1) | xF(8) | yF(8) | zF(8)
 *      → "whole" parts are 15-bit unsigned, "fractional" parts 8-bit unsigned,
 *        sign in the top bit of each whole-word
 *   tVelCoord: xW(7)+xNeg(1) | yW(7)+yNeg(1) | zW(7)+zNeg(1) | xF(8) | yF(8) | zF(8)
 *      → narrower whole parts (7-bit)
 *
 * SPAMflags bitfield:
 *   horn(1) wrongway(1) lights(2) brake(1) frontSkid(1) rearSkid(1) gear(4)
 *   reset(1) flying(1) newdata(1) disabledcollisions(MAXCARPOSITIONS=6)
 *
 * For now we expose the raw byte windows for each sub-field. The bit-packed
 * coordinates are not decoded into floats yet — see TODOs below.
 *
 * TODO(spam-position-coords): decode tPosCoord into {x, y, z} floats.
 *   Layout: word0 [xW:15][xNeg:1] | word1 [yW:15][yNeg:1] | word2 [zW:15][zNeg:1]
 *           | byte6 xF | byte7 yF | byte8 zF.
 *   Reconstruction: x = (xNeg ? -1 : 1) * (xW + xF/256) — verify against
 *   SPAM_UnCompressCarData (MCity_d.exe!0x?? per festats.cpp / SPAM.c:902).
 *
 * TODO(spam-position-coords): decode tVelCoord (linearVel and angularVel)
 *   into {x, y, z} floats. Same layout as tPosCoord but the whole-word is
 *   only 7 bits wide (smaller velocity range): [xW:7][xNeg:1] etc.
 */
export class CarPositionFrame {
    static readonly SIZE = 36;

    private constructor(private readonly _buf: Buffer) {}

    static deserialize(buf: Buffer): CarPositionFrame {
        if (buf.byteLength < CarPositionFrame.SIZE) {
            throw new Error(
                `CarPositionFrame: need ${CarPositionFrame.SIZE} bytes, got ${buf.byteLength}`,
            );
        }
        return new CarPositionFrame(Buffer.from(buf.subarray(0, CarPositionFrame.SIZE)));
    }

    get carIndex(): number {
        return this._buf.readInt8(0);
    }

    /**
     * Raw 9-byte tPosCoord (XYZ position).
     * TODO(spam-position-coords): expose decoded {x, y, z} floats — see class doc.
     */
    get posBytes(): Buffer {
        return Buffer.from(this._buf.subarray(1, 10));
    }

    /**
     * Raw 6-byte tVelCoord (linear velocity).
     * TODO(spam-position-coords): expose decoded {x, y, z} floats.
     */
    get linearVelBytes(): Buffer {
        return Buffer.from(this._buf.subarray(10, 16));
    }

    /**
     * Raw 6-byte tVelCoord (angular velocity).
     * TODO(spam-position-coords): expose decoded {x, y, z} floats.
     */
    get angularVelBytes(): Buffer {
        return Buffer.from(this._buf.subarray(16, 22));
    }

    /**
     * Quaternion orientation. Each axis is signed 14.2 fixed-point: the i16
     * value divided by 4 gives the floating-point component.
     */
    get orientation(): { x: number; y: number; z: number; w: number } {
        return {
            x: this._buf.readInt16LE(22) / 4,
            y: this._buf.readInt16LE(24) / 4,
            z: this._buf.readInt16LE(26) / 4,
            w: this._buf.readInt16LE(28) / 4,
        };
    }

    /** Track slice index (cumulative around the lap). */
    get sliceTotal(): number {
        return this._buf.readInt16LE(30);
    }

    /** Raw 32-bit SPAM flags bitfield. */
    get flagsRaw(): number {
        return this._buf.readUInt32LE(32);
    }

    /** Decoded subset of the flags bitfield (the commonly-useful bits). */
    get flags(): {
        horn: boolean;
        wrongWay: boolean;
        brake: boolean;
        frontSkid: boolean;
        rearSkid: boolean;
        gear: number;
        reset: boolean;
        flying: boolean;
        newData: boolean;
        lights: number;
    } {
        const f = this.flagsRaw;
        return {
            horn: (f & 0x0001) !== 0,
            wrongWay: (f & 0x0002) !== 0,
            lights: (f >> 2) & 0x03, // bits 2..3
            brake: (f & 0x0010) !== 0,
            frontSkid: (f & 0x0020) !== 0,
            rearSkid: (f & 0x0040) !== 0,
            gear: (f >> 7) & 0x0f, // bits 7..10
            reset: (f & 0x0800) !== 0,
            flying: (f & 0x1000) !== 0,
            newData: (f & 0x2000) !== 0,
        };
    }
}

/**
 * Inbound SPAM_POSITION (application packet type 5).
 *
 * Wire layout (variable, pack(1)):
 *   [0]    u8  PKTINDEX = 5
 *   [1..4] i32 tickSent                  client sequence (drop older for UDP)
 *   [5..]  CarPositionFrame[]            one or more 36-byte frames
 *
 * The number of frames is `(blobLen - 5) / 36`. Trailing bytes < 36 are
 * uninitialized/junk on the wire.
 */
export class SpamPositionPacket {
    static readonly HEADER_SIZE = 5;
    static readonly TYPE = 5;

    private constructor(
        private readonly _tickSent: number,
        private readonly _frames: CarPositionFrame[],
    ) {}

    static deserialize(buf: Buffer): SpamPositionPacket {
        if (buf.byteLength < SpamPositionPacket.HEADER_SIZE) {
            throw new Error(
                `SpamPositionPacket: need at least ${SpamPositionPacket.HEADER_SIZE} bytes, got ${buf.byteLength}`,
            );
        }
        if (buf[0] !== SpamPositionPacket.TYPE) {
            throw new Error(
                `SpamPositionPacket: expected first byte = ${SpamPositionPacket.TYPE}, got ${buf[0]}`,
            );
        }
        const tickSent = buf.readInt32LE(1);

        const frames: CarPositionFrame[] = [];
        let offset = SpamPositionPacket.HEADER_SIZE;
        while (offset + CarPositionFrame.SIZE <= buf.byteLength) {
            frames.push(CarPositionFrame.deserialize(buf.subarray(offset)));
            offset += CarPositionFrame.SIZE;
        }
        return new SpamPositionPacket(tickSent, frames);
    }

    get tickSent(): number {
        return this._tickSent;
    }

    get frames(): readonly CarPositionFrame[] {
        return this._frames;
    }
}

/**
 * Inbound SPAM_FINISHED_RACE (application packet type 7) —
 * `tRacerFinishedPkt` (SPAM.c:71).
 *
 * Wire layout (8 bytes, pack(1)):
 *   [0]    u8  PKTINDEX = 7
 *   [1..4] i32 tickSent
 *   [5]    i8  carIndex
 *   [6]    i8  finishType    enum (won / lost / DNF / faulted etc.)
 *   [7]    i8  faulted       boolean-ish
 */
export class SpamRacerFinishedPacket {
    static readonly SIZE = 8;
    static readonly TYPE = 7;

    private constructor(
        private readonly _tickSent: number,
        private readonly _carIndex: number,
        private readonly _finishType: number,
        private readonly _faulted: number,
    ) {}

    static deserialize(buf: Buffer): SpamRacerFinishedPacket {
        if (buf.byteLength < SpamRacerFinishedPacket.SIZE) {
            throw new Error(
                `SpamRacerFinishedPacket: need ${SpamRacerFinishedPacket.SIZE} bytes, got ${buf.byteLength}`,
            );
        }
        if (buf[0] !== SpamRacerFinishedPacket.TYPE) {
            throw new Error(
                `SpamRacerFinishedPacket: expected first byte = ${SpamRacerFinishedPacket.TYPE}, got ${buf[0]}`,
            );
        }
        return new SpamRacerFinishedPacket(
            buf.readInt32LE(1),
            buf.readInt8(5),
            buf.readInt8(6),
            buf.readInt8(7),
        );
    }

    get tickSent(): number {
        return this._tickSent;
    }
    get carIndex(): number {
        return this._carIndex;
    }
    /** Enum: see Frontend code; values include normal-finish / DNF / faulted. */
    get finishType(): number {
        return this._finishType;
    }
    get faulted(): boolean {
        return this._faulted !== 0;
    }
}

/**
 * Inbound SPAM_SCORE (application packet type 10) — `tScorePkt` (SPAM.c:63).
 *
 * Wire layout (6 bytes, pack(1)):
 *   [0]    u8  PKTINDEX = 10
 *   [1]    i8  carIndex
 *   [2..5] i32 stuntScore
 *
 * (The struct comment says "82 b" but that is a copy/paste from tStatPkt;
 * actual size is 6 bytes.)
 */
export class SpamScorePacket {
    static readonly SIZE = 6;
    static readonly TYPE = 10;

    private constructor(
        private readonly _carIndex: number,
        private readonly _stuntScore: number,
    ) {}

    static deserialize(buf: Buffer): SpamScorePacket {
        if (buf.byteLength < SpamScorePacket.SIZE) {
            throw new Error(
                `SpamScorePacket: need ${SpamScorePacket.SIZE} bytes, got ${buf.byteLength}`,
            );
        }
        if (buf[0] !== SpamScorePacket.TYPE) {
            throw new Error(
                `SpamScorePacket: expected first byte = ${SpamScorePacket.TYPE}, got ${buf[0]}`,
            );
        }
        return new SpamScorePacket(buf.readInt8(1), buf.readInt32LE(2));
    }

    get carIndex(): number {
        return this._carIndex;
    }
    get stuntScore(): number {
        return this._stuntScore;
    }
}

/**
 * Inbound BIG_PACKET (application packet type 8) — fragment-reassembly
 * wrapper. The leaked source decompiles as `PACKET_ReceiveBigPacket_CALLBACK`
 * (MCity_d.exe!0x00690920).
 *
 * Wire layout (16-byte header, then chunk payload):
 *   [0]      u8  PKTINDEX = 8
 *   [1]      u8  innerType        application packet type when reassembled
 *   [2]      u8  totalChunks
 *   [3]      u8  chunkIndex       zero-based
 *   [4..7]   i32 channelId0       BigChannel session marker (LE)
 *   [8..9]   u16 innerLength      total reassembled body length
 *   [10..11] padding (commonly 0xCC uninit memory on the wire)
 *   [12..15] i32 channelId1       second BigChannel session marker
 *   [16..]   bytes               this chunk's payload
 *
 * On the receiving client a 0x810-byte slot is reserved per channel; chunks
 * are memcpy'd at `chunkIndex * 0xec` (236) and dispatched to the inner
 * packet-type handler when `chunkIndex == totalChunks - 1`.
 */
export class SpamBigPacketHeader {
    static readonly SIZE = 16;
    static readonly TYPE = 8;

    private constructor(private readonly _buf: Buffer) {}

    static deserialize(buf: Buffer): SpamBigPacketHeader {
        if (buf.byteLength < SpamBigPacketHeader.SIZE) {
            throw new Error(
                `SpamBigPacketHeader: need ${SpamBigPacketHeader.SIZE} bytes, got ${buf.byteLength}`,
            );
        }
        if (buf[0] !== SpamBigPacketHeader.TYPE) {
            throw new Error(
                `SpamBigPacketHeader: expected first byte = ${SpamBigPacketHeader.TYPE}, got ${buf[0]}`,
            );
        }
        return new SpamBigPacketHeader(
            Buffer.from(buf.subarray(0, SpamBigPacketHeader.SIZE)),
        );
    }

    get innerType(): number {
        return this._buf.readUInt8(1);
    }
    get totalChunks(): number {
        return this._buf.readUInt8(2);
    }
    get chunkIndex(): number {
        return this._buf.readUInt8(3);
    }
    get channelId0(): number {
        return this._buf.readUInt32LE(4);
    }
    /** Total reassembled inner-message length (bytes). */
    get innerLength(): number {
        return this._buf.readUInt16LE(8);
    }
    get channelId1(): number {
        return this._buf.readUInt32LE(12);
    }
}
