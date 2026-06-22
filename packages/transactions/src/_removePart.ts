import { MessageNode, getServerLogger } from "rusty-motors-shared";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

const defaultLogger = getServerLogger("handlers/_removePart");

/**
 * Handle MC_REMOVE_PART (msgNo 182 / 0x00B6).
 *
 * Sent when the player uninstalls a part from a vehicle (without scrapping
 * it). The part should move from the vehicle's parts list back into the
 * player's inventory. Free uninstall — no cash transaction.
 *
 * Wire shape: GenericRequest (10 bytes) — `data` carries the partId to
 * remove.
 *
 * Stub: parse partId, log, ack with MC_SUCCESS. No state change.
 *
 * Original implementation: MCity/Server/MCParts.cpp:410 (RemovePart).
 *
 * TODO(parts-mgmt): validate the partId is actually installed on a
 *   vehicle owned by the sending persona; reject with MC_DB_ERROR if
 *   not found.
 * TODO(parts-mgmt): refuse to remove the vehicle's root chassis
 *   (legacy guard: parentPartId === 0 means root).
 * TODO(parts-mgmt): remove the part *and its child subtree* (uninstalling
 *   a chassis takes its suspension and brakes with it) — Recons handles
 *   this via removePartSubtree at mco-revival.mjs:1733.
 * TODO(parts-mgmt): clear parentPartId/attachmentPoint and move the
 *   subtree into the player's inventory.
 * TODO(parts-mgmt): persist via the stored proc equivalent and invalidate
 *   the affected vehicle's car-info cache.
 */
export async function _removePart({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const partId =
        packet.data.byteLength >= 6 ? packet.data.readUInt32LE(2) : 0;

    log.info("MC_REMOVE_PART received (stub — no inventory move/DB write)", {
        connectionId,
        partId,
    });

    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101; // MC_SUCCESS
    pReply.msgReply = 182; // MC_REMOVE_PART

    const rPacket = new MessageNode();
    rPacket.sequence = packet.sequenceNumber;
    rPacket.setPayloadEncryption(true);
    rPacket.setDataBuffer(pReply.serialize());

    return { connectionId, messages: [rPacket] };
}
