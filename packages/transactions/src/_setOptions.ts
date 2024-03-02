import { OldServerMessage } from "@rustymotors/shared";
import { MessageHandlerArgs, MessageHandlerResult } from "../types.js";
import { PlayerOptionsMessage } from "./messageStructs/PlayerOptionsMessage.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";

export async function _setOptions(
    args: MessageHandlerArgs,
): Promise<MessageHandlerResult> {
    const playerOptionsMessage = new PlayerOptionsMessage();
    playerOptionsMessage.deserialize(args.packet.serialize());

    // Log the message
    args.log.debug(`PlayerOptionsMessage: ${playerOptionsMessage.toString()}`);

    // TODO: Save the options

    const response = new GenericReplyMessage();
    response.msgNo = 101;
    response.msgReply = 109;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = args.packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(response.serialize());

    return { connectionId: args.connectionId, messages: [responsePacket] };
}
