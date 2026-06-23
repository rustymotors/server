import { MessageNode } from "rusty-motors-shared";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/updateCachedVehicle");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _updateCachedVehicle({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 163;
    const rPacket = new MessageNode();
    rPacket.sequence = packet.sequenceNumber;
    rPacket.setPayloadEncryption(true);

    rPacket.setDataBuffer(pReply.serialize());

    log.debug(`updateCachedVehicle: ${rPacket.toString()}`);

    return { connectionId, messages: [] };
}
