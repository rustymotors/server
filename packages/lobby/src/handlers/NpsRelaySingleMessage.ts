/**
 * Parser for the SINGLE-family NPS relay messages.
 *
 * Covers opcodes 0x93 (NPS_SEND_BUDDY_LONG), 0x95 (NPS_SEND_SINGLE_LONG),
 * 0x97 (NPS_SEND_NOT_SINGLE_LONG), and their _LOGGED siblings (+1 each).
 *
 * Wire layout (verified against the leaked client via Ghidra and roundtripped
 * against captured wire bytes):
 *
 *   [0..1]   u16 BE   opcode
 *   [2..3]   u16 BE   totalLength    (whole packet, header included)
 *   [4..7]   u32 BE   commId
 *   [8..11]  u32 BE   senderUserId
 *   [12..15] u32 BE   filterUserId   (single user — recipient for SINGLE/BUDDY,
 *                                      excluded user for NOT_SINGLE)
 *   [16..]   bytes    application blob (variable length)
 *
 * 16-byte framing overhead. The blob's first byte is an application-level
 * packet type — see {@link NpsRelayApplicationPacketType}.
 *
 * Source decompilation:
 *   ReallySendMessage (npslib): writes `[u32 LE filterUserId][blob]` into an
 *     intermediate buffer.
 *   MsgPack::Compress (npslib): wraps the body with the 12-byte routing block
 *     (commId, senderUserId, filterUserId) and the 4-byte NPS header
 *     (opcode + totalLength), byte-swapping each u32 to network order.
 *
 * TODO(relay-logged-variants): the parser accepts opcodes 0x94, 0x96, 0x98
 *   (the _LOGGED siblings of buddy/single/not-single) but no entries are
 *   registered in npsCommandHandlers for them. If the client ever sends a
 *   LOGGED variant we'll get "Unknown command" Sentry errors. Same handler
 *   bodies as the unlogged versions; the only difference is the server is
 *   expected to write a moderation log line. Wire them up when one shows up.
 *
 * TODO(relay-list-family): no parser yet for the LIST family (0x8F
 *   NPS_SEND_LIST_LONG, 0x91 NPS_SEND_NOT_LIST_LONG, plus their _LOGGED
 *   siblings 0x90/0x92). Different envelope shape:
 *     [u16 BE opcode][u16 BE totalLength]
 *     [u32 BE commId][u32 BE senderUserId]
 *     [u32 BE listLength][listLength × u32 BE userIds]
 *     [blob]
 *   16+(4*listLength)-byte framing overhead. Implement once a list-variant
 *   capture exists (we have the layout from Ghidra but no real bytes yet).
 *
 * TODO(relay-broadcast-family): no parser yet for the broadcast family
 *   (0x89 NPS_SEND_ALL_LONG, 0x8B NPS_SEND_PLUG_IN_LONG, 0x8D
 *   NPS_SEND_GAME_READY_LIST_LONG, plus their _LOGGED siblings). 12-byte
 *   envelope (no filter user id):
 *     [u16 BE opcode][u16 BE totalLength]
 *     [u32 BE commId][u32 BE senderUserId]
 *     [blob]
 *   Implement once one shows up.
 */

const SINGLE_FAMILY_OPCODES = new Set<number>([
    0x93, // NPS_SEND_BUDDY_LONG
    0x94, // NPS_SEND_BUDDY_LONG_LOGGED
    0x95, // NPS_SEND_SINGLE_LONG
    0x96, // NPS_SEND_SINGLE_LONG_LOGGED
    0x97, // NPS_SEND_NOT_SINGLE_LONG
    0x98, // NPS_SEND_NOT_SINGLE_LONG_LOGGED
]);

/**
 * Application-level packet type carried in the first byte of the relay blob.
 * The receiving client dispatches on this byte through a function table at
 * MCity_d.exe!0x011a6a50 (eleven entries, indices 0-10).
 *
 * Parser coverage today (see SpamApplicationPackets.ts):
 *   ✓ 5  SPAM_POSITION              — tPositionPkt (Security.h:114)
 *   ✓ 7  SPAM_FINISHED_RACE         — tRacerFinishedPkt (SPAM.c:71)
 *   ✓ 8  BIG_PACKET (header only)   — see SpamBigPacketHeader
 *   ✓ 10 SPAM_SCORE                 — tScorePkt (SPAM.c:63)
 *
 * TODO(app-packet-types): no parser yet for the following — add as needed:
 *   - 0 FIRST_CONTACT          (PACKET_FirstContact_CALLBACK)
 *   - 1 MENU_PRE_RACE_DATA     (180 bytes/car, MenuCom_Recv_PreRaceData_CALLBACK)
 *   - 2 CHECKPOINT             (PACKET_Checkpoint_CALLBACK)
 *   - 3 SIM_SYNC_SETUP         (variable; appended into a buffer of max ~2700 bytes,
 *                               SimCom_SynchSetup_CALLBACK)
 *   - 4 SIM_INPUT              (empty client-side stub; may still be sent)
 *   - 6 SPAM_SYNC_FINAL_STATS  (FeStats_Obj, 360 bytes nested struct;
 *                               typically arrives wrapped in BIG_PACKET)
 *   - 9 LOADING_BAR            (PACKET_ReceiveLoadingBar_CALLBACK)
 */
export const NpsRelayApplicationPacketType = {
    FIRST_CONTACT: 0,
    MENU_PRE_RACE_DATA: 1,
    CHECKPOINT: 2,
    SIM_SYNC_SETUP: 3,
    SIM_INPUT: 4, // empty stub on the client side
    SPAM_POSITION: 5,
    SPAM_SYNC_FINAL_STATS: 6,
    SPAM_FINISHED_RACE: 7,
    BIG_PACKET: 8, // fragment-reassembly wrapper; inner type at body[1]
    LOADING_BAR: 9,
    SPAM_SCORE: 10,
} as const;

export type NpsRelayApplicationPacketTypeValue =
    (typeof NpsRelayApplicationPacketType)[keyof typeof NpsRelayApplicationPacketType];

const APPLICATION_PACKET_TYPE_NAMES: Record<number, string> = Object.entries(
    NpsRelayApplicationPacketType,
).reduce(
    (acc, [k, v]) => {
        acc[v as number] = k;
        return acc;
    },
    {} as Record<number, string>,
);

/**
 * Returns the human-readable name of an application packet type byte, or
 * `'UNKNOWN'` if the byte is outside the 0..10 range.
 */
export function describeApplicationPacketType(byte: number): string {
    return APPLICATION_PACKET_TYPE_NAMES[byte] ?? 'UNKNOWN';
}

export class NpsRelaySingleMessage {
    private _opcode = 0;
    private _length = 0;
    private _commId = 0;
    private _senderUserId = 0;
    private _filterUserId = 0;
    private _blob: Buffer = Buffer.alloc(0);

    static readonly HEADER_SIZE = 16;

    /**
     * Parse a complete relay packet (header + routing block + blob).
     * Throws on a length or opcode mismatch.
     */
    static deserialize(buf: Buffer): NpsRelaySingleMessage {
        if (buf.byteLength < NpsRelaySingleMessage.HEADER_SIZE) {
            throw new Error(
                `NpsRelaySingleMessage: need at least ${NpsRelaySingleMessage.HEADER_SIZE} bytes, got ${buf.byteLength}`,
            );
        }
        const m = new NpsRelaySingleMessage();
        m._opcode = buf.readUInt16BE(0);
        m._length = buf.readUInt16BE(2);

        if (!SINGLE_FAMILY_OPCODES.has(m._opcode)) {
            throw new Error(
                `NpsRelaySingleMessage: opcode 0x${m._opcode.toString(16)} is not in the SINGLE family`,
            );
        }
        if (buf.byteLength !== m._length) {
            throw new Error(
                `NpsRelaySingleMessage: length field (${m._length}) does not match buffer (${buf.byteLength})`,
            );
        }

        m._commId = buf.readUInt32BE(4);
        m._senderUserId = buf.readUInt32BE(8);
        m._filterUserId = buf.readUInt32BE(12);
        m._blob = Buffer.from(buf.subarray(16));
        return m;
    }

    get opcode(): number {
        return this._opcode;
    }

    get length(): number {
        return this._length;
    }

    get commId(): number {
        return this._commId;
    }

    get senderUserId(): number {
        return this._senderUserId;
    }

    /**
     * For SINGLE/BUDDY this is the *recipient* user id (the only one that
     * receives the relay). For NOT_SINGLE this is the *excluded* user id
     * (the only one that does NOT receive the relay).
     */
    get filterUserId(): number {
        return this._filterUserId;
    }

    /** Raw application payload (defensive copy). */
    get blob(): Buffer {
        return Buffer.from(this._blob);
    }

    /**
     * The first byte of the blob is the application-level packet type.
     * Returns `-1` if the blob is empty.
     */
    get applicationPacketType(): number {
        return this._blob.byteLength > 0 ? this._blob[0]! : -1;
    }

    /** Human-readable summary, useful for log lines. */
    describe(): string {
        const opHex = this._opcode.toString(16).padStart(2, '0');
        const appType = this.applicationPacketType;
        const appName = describeApplicationPacketType(appType);
        return (
            `NpsRelaySingleMessage{opcode=0x${opHex}, len=${this._length}, ` +
            `commId=${this._commId}, sender=${this._senderUserId}, ` +
            `filter=${this._filterUserId}, blobLen=${this._blob.byteLength}, ` +
            `app=${appName}(${appType})}`
        );
    }
}

/**
 * Rewrite a 16-byte SEND envelope to a 12-byte RECEIVE envelope.
 *
 * The client sends:  [opcode:2][len:2][commId:4][sender:4][filterUserId:4][blob]
 * npslib expects:    [opcode:2][len:2][commId:4][sender:4][blob]
 *
 * Dropping the 4-byte filterUserId field and fixing the length field is
 * required — without it the recipient's npslib mis-parses the envelope and
 * silently drops the application packet (FIRST_CONTACT etc. never fire).
 */
export function rewriteSingleEnvelope(frame: Buffer): Buffer {
    if (frame.byteLength < NpsRelaySingleMessage.HEADER_SIZE) {
        return frame;
    }
    const newLen = frame.byteLength - 4;
    const out = Buffer.alloc(newLen);
    frame.copy(out, 0, 0, 2);   // opcode unchanged
    out.writeUInt16BE(newLen, 2); // corrected total length
    frame.copy(out, 4, 4, 12);  // commId + senderUserId
    frame.copy(out, 12, 16);    // blob (skip the 4-byte filterUserId)
    return out;
}

/**
 * Shared stub-handler body for the SINGLE-family relay opcodes
 * (SEND_BUDDY_LONG, SEND_SINGLE_LONG, SEND_NOT_SINGLE_LONG plus their
 * _LOGGED siblings). Parses the envelope, emits a structured debug log, and
 * never produces responses — correct for single-player testing where there
 * are no other channel members to relay to.
 *
 * On a malformed envelope, logs a warning instead of throwing so the message
 * queue stays alive.
 */
export function logRelayStub(args: {
    opcodeName: string;
    connectionId: string;
    messageBytes: Buffer;
    log: { debug: (...args: unknown[]) => void; warn: (...args: unknown[]) => void };
}): void {
    const { opcodeName, connectionId, messageBytes, log } = args;
    try {
        const relay = NpsRelaySingleMessage.deserialize(messageBytes);
        log.debug(`${opcodeName} received (stub — no relay)`, {
            connectionId,
            commId: relay.commId,
            senderUserId: relay.senderUserId,
            filterUserId: relay.filterUserId,
            blobLength: relay.blob.byteLength,
            applicationPacketType: relay.applicationPacketType,
            applicationPacketName: describeApplicationPacketType(
                relay.applicationPacketType,
            ),
        });
    } catch (err) {
        log.warn(`Failed to parse ${opcodeName} envelope`, {
            connectionId,
            err,
            body: messageBytes.toString('hex'),
            bodyLength: messageBytes.byteLength,
        });
    }
}
