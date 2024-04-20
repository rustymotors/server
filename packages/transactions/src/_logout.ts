import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { OldServerMessage } from "../../shared";
import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _logout(
    args: MessageHandlerArgs,
): Promise<MessageHandlerResult> {
    log.setName("mcos:logout");
    // Create new response packet
    const response = new GenericReplyMessage();
    response.msgNo = 101;
    response.msgReply = 106;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = args.packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(response.serialize());

    return { connectionId: args.connectionId, messages: [responsePacket] };
}
