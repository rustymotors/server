import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { OldServerMessage } from "@rustymotors/shared";
import { TunablesMessage } from "./TunablesMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _getTunables({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getTunablesMessage = new GenericRequestMessage();
    getTunablesMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getTunablesMessage.toString()}`);

    const tunablesMessage = new TunablesMessage();
    tunablesMessage._msgNo = 390;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(tunablesMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
