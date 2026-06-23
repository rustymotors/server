/**
 * Minimal NPS packet builders for multi-client integration tests.
 *
 * All formats are derived from our own server-side parsers and session
 * captures — no external source material.
 *
 * Wire format reminder (version-0 NPS header):
 *   [id:2 BE][totalLength:2 BE][body...]
 */

// ---------------------------------------------------------------------------
// 0x0106  NPS_OPEN_COMM_CHANNEL
// ---------------------------------------------------------------------------
// Body field layout (BytableMessage field types, all BE):
//   commId          Dword   4
//   riffName        PString 5  (empty: [00 00 00 01 00])
//   slotNumber      Dword   4
//   slotFlags       Dword   4
//   portNumber      Dword   4
//   protocol        Dword   4
//   userId          Dword   4
//   connectedUsers  Short   2
//   openChannels    Short   2
//   canReady        Short   2
//   gameReady       Short   2
//   isMaster        Short   2
//   channelType     Short   2
//   password        PString 5  (empty: [00 00 00 01 00])
//   disableBacklog  Short   2
//   gameServerIsRunning Boolean 1
//   launchGameServer Short  2
//   maxReadyPlayers Short   2
//   sku             Dword   4
//   sendRate        Dword   4
//   channelData     ChannelData 256
//   flags           Dword   4
// Body total = 321 bytes.  Packet total = 4 + 321 = 325 bytes.

const OPEN_COMM_CHANNEL_TOTAL = 325;

export function openCommChannelPacket(commId: number, userId: number): Buffer {
    const buf = Buffer.alloc(OPEN_COMM_CHANNEL_TOTAL);
    // Header
    buf.writeUInt16BE(0x0106, 0);
    buf.writeUInt16BE(OPEN_COMM_CHANNEL_TOTAL, 2);
    // commId at body[0] = packet[4]
    buf.writeInt32BE(commId, 4);
    // riffName PString at body[4] = packet[8]: length=1 (null terminator only)
    buf.writeUInt32BE(1, 8);
    buf[12] = 0; // null terminator
    // slotNumber[13..16], slotFlags[17..20], portNumber[21..24], protocol[25..28] — zero
    // userId at body[25] = packet[29]
    buf.writeInt32BE(userId, 29);
    // shorts[33..44] — zero
    // password PString at body[41] = packet[45]: length=1
    buf.writeUInt32BE(1, 45);
    buf[49] = 0; // null terminator
    // remainder (disableBacklog, booleans, shorts, dwords, channelData[256], flags) — zero
    return buf;
}

// ---------------------------------------------------------------------------
// 0x0100  NPS_USER_LOGIN (lobby port)
// ---------------------------------------------------------------------------
// This builder produces a packet recognised by handleOpenCommChannel's
// predecessor step.  Derived from parsing the port-7003 session fixture
// (event 2, id=0x0100, 143 bytes):
//
//   [id:2 BE][totalLength:2 BE]
//   [userId:4 BE]
//   [userName PString: [len:4 BE][bytes][null]]
//   [userData Buffer: remaining bytes]
//
// For test purposes we use a fixed 143-byte structure matching the fixture.
// Only userId is parameterised; all other fields are zeroed.

export function lobbyLoginPacket(userId: number): Buffer {
    // Mirror the 143-byte fixture packet: header(4) + userId(4) + rest zeroed.
    // The server reads userId from bytes[4..7].
    const totalLen = 143;
    const buf = Buffer.alloc(totalLen);
    buf.writeUInt16BE(0x0100, 0);
    buf.writeUInt16BE(totalLen, 2);
    buf.writeInt32BE(userId, 4);
    // userName PString: length=1 (null only) at offset 8
    buf.writeUInt32BE(1, 8);
    buf[12] = 0;
    // userData fills the rest as zeros
    return buf;
}

// ---------------------------------------------------------------------------
// SINGLE-family relay envelope (0x93 / 0x95 / 0x97)
// ---------------------------------------------------------------------------
// Wire layout (16-byte SEND format, from NpsRelaySingleMessage.ts):
//   [opcode:2 BE][totalLen:2 BE][commId:4 BE][senderUserId:4 BE][filterUserId:4 BE][blob]

export function relayEnvelope(
    opcode: 0x93 | 0x95 | 0x97,
    commId: number,
    senderUserId: number,
    filterUserId: number,
    blob: Buffer = Buffer.alloc(4),
): Buffer {
    const totalLen = 16 + blob.byteLength;
    const buf = Buffer.alloc(totalLen);
    buf.writeUInt16BE(opcode, 0);
    buf.writeUInt16BE(totalLen, 2);
    buf.writeUInt32BE(commId, 4);
    buf.writeUInt32BE(senderUserId, 8);
    buf.writeUInt32BE(filterUserId, 12);
    blob.copy(buf, 16);
    return buf;
}
