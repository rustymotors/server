import { OldServerMessage, getServerLogger } from "rusty-motors-shared";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

const defaultLogger = getServerLogger("handlers/_repairMultipleParts");

/**
 * Handle MC_REPAIR_MULTIPLE_PARTS (msgNo 178 / 0x00B2).
 *
 * Wire shape: a header (msgNo + count) followed by a list of partIds.
 * The exact layout is captured in MCDefs.h's RepairMultiplePartsMsg struct
 * — we don't need to fully decode it for the stub since we don't act on
 * the parts list.
 *
 * Stub: log receipt and ack with MC_SUCCESS. No actual repair, no list
 * parsing, no cash deduction. Recons does the same — its handler is a
 * single-line log + generic reply at mco-revival.mjs:3293-3296.
 *
 * Original implementation: MCity/Server/MCParts.cpp:324
 *   (RepairMultipleParts).
 *
 * TODO(parts-mgmt): parse the partId list from packet.data once we need
 *   to act on each one. Likely shape (pack(1)): WORD msgNo, DWORD raceID,
 *   WORD noParts, DWORD partID[noParts]. Confirm against MCDefs.h.
 * TODO(parts-mgmt): for each partId, validate ownership and run the
 *   repair stored proc.
 * TODO(parts-mgmt-economy): aggregate repair cost across the list and
 *   debit once; reject with MC_INSUFFICIENT_FUNDS if total > balance.
 * TODO(parts-mgmt): on partial failure, return MC_REPAIRED_PARTS_LIST
 *   (msgNo 179) listing which parts succeeded — not a generic ack.
 */
export async function _repairMultipleParts({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    log.info(
        "MC_REPAIR_MULTIPLE_PARTS received (stub — no DB write/economy/list parse)",
        {
            connectionId,
            payloadBytes: packet.data.byteLength,
        },
    );

    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101; // MC_SUCCESS
    pReply.msgReply = 178; // MC_REPAIR_MULTIPLE_PARTS

    const rPacket = new OldServerMessage();
    rPacket._header.sequence = packet.sequenceNumber;
    rPacket._header.flags = 8;
    rPacket.setBuffer(pReply.serialize());

    return { connectionId, messages: [rPacket] };
}
