import { OldServerMessage } from "rusty-motors-shared";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_crcPreRaceDataTestDrive");

/**
 * Handle MC_CRC_PRE_RACE_DATA_TEST_DRIVE (msgNo 455 / 0x01C7).
 *
 * Test-drive variant of MC_CRC_PRE_RACE_DATA — uses the same wire struct but
 * is sent during test-drive sessions (no live race). Per MCDefs.h:559 it
 * "returns Ack/Nak", which is what this stub provides: a generic
 * MC_SUCCESS reply referencing opcode 455.
 *
 * Original implementation: MCity/Server/MCRaces.cpp:1189.
 *
 * TODO(crc-test-drive): parse the CRCPreRaceData payload (struct shared with
 *   opcode 434) and apply the same anti-cheat checks the live-race path does
 *   — track / sliceInfo / pacejka CRC comparison, per-racer car/parts CRC
 *   validation. For test-drive we likely just verify the asset CRCs and
 *   ignore the per-racer block (only one driver).
 */
export async function _crcPreRaceDataTestDrive({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101; // MC_SUCCESS
    pReply.msgReply = 455; // MC_CRC_PRE_RACE_DATA_TEST_DRIVE
    const rPacket = new OldServerMessage();
    rPacket._header.sequence = packet.sequenceNumber;
    rPacket._header.flags = 8;

    rPacket.setBuffer(pReply.serialize());

    log.debug(`MC_CRC_PRE_RACE_DATA_TEST_DRIVE ack: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}
