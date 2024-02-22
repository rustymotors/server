import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
import { OwnedVehicle, OwnedVehiclesMessage } from "./OwnedVehiclesMessage.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { PlayerInfoMessage } from "./PlayerInfoMessage.js";
import { PlayerOptionsMessage } from "./messageStructs/PlayerOptionsMessage.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { PlayerPhysicalMessage } from "./PlayerPhysicalMessage.js";

export async function _updatePlayerPhysical(
    args: MessageHandlerArgs,
): Promise<MessageHandlerResult> {
    const updatePlayerPhysicalMessage = new PlayerPhysicalMessage();
    updatePlayerPhysicalMessage.deserialize(args.packet.serialize());

    // Log the message
    args.log.debug(
        `UpdatePlayerPhysicalMessage: ${updatePlayerPhysicalMessage.toString()}`,
    );

    // TODO: Save the options

    const response = new GenericReplyMessage();
    response.msgNo = 101;
    response.msgReply = 266;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = args.packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(response.serialize());

    return { connectionId: args.connectionId, messages: [responsePacket] };
}
