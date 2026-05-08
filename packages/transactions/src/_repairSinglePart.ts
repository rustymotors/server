import { OldServerMessage } from "rusty-motors-shared";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_repairSinglePart");

/**
 * Handle MC_REPAIR_SINGLE_PART (msgNo 177 / 0x00B1).
 *
 * Wire shape: GenericRequest (10 bytes) — `data` carries the partId to
 * repair. The legacy client expects a generic MC_SUCCESS reply.
 *
 * Stub: parse partId, log, ack with MC_SUCCESS. No actual repair, no cash
 * deduction.
 *
 * Original implementation: MCity/Server/MCParts.cpp:286 (RepairSinglePart).
 *
 * TODO(parts-mgmt): validate the partId belongs to a vehicle owned by
 *   the sending persona; reject if not.
 * TODO(parts-mgmt-economy): debit the player's bank balance by the
 *   part's repairPrice; reject with MC_INSUFFICIENT_FUNDS if balance
 *   too low. Recons does this in-memory via creditBank/debitBank against
 *   a single global localBankBalance — needs to become a per-persona
 *   transaction in the real DB.
 * TODO(parts-mgmt): set the part's damage to 0 and persist (stored proc
 *   equivalent of MC__MC_REPAIRPART). Invalidate the car-info cache.
 * TODO(parts-mgmt): on SP failure, send RequestFailed(MC_DB_ERROR)
 *   instead of MC_SUCCESS.
 */
export async function _repairSinglePart({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const partId =
        packet.data.byteLength >= 6 ? packet.data.readUInt32LE(2) : 0;

    log.info("MC_REPAIR_SINGLE_PART received (stub — no DB write/economy)", {
        connectionId,
        partId,
    });

    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101; // MC_SUCCESS
    pReply.msgReply = 177; // MC_REPAIR_SINGLE_PART

    const rPacket = new OldServerMessage();
    rPacket._header.sequence = packet.sequenceNumber;
    rPacket._header.flags = 8;
    rPacket.setBuffer(pReply.serialize());

    return { connectionId, messages: [rPacket] };
}
