import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _logout(
    args: MessageHandlerArgs,
): Promise<MessageHandlerResult> {
    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 278;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = args.packet._header.sequence;
    responsePacket._header.flags = -1;

    // Log the message
    args.log.debug(`LogoutMessage: ${pReply.toString()}`);

    return { connectionId: args.connectionId, messages: [responsePacket] };

}
