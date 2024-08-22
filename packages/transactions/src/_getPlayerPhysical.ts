import { OldServerMessage } from "../../shared/OldServerMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { PlayerPhysicalMessage } from "./PlayerPhysicalMessage.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

export async function _getPlayerPhysical({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getPlayerPhysicalMessage = new GenericRequestMessage();
    getPlayerPhysicalMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getPlayerPhysicalMessage.toString()}`);

    const playerId = getPlayerPhysicalMessage.data.readUInt32LE(0);

    const playerPhysicalMessage = new PlayerPhysicalMessage();
    playerPhysicalMessage._msgNo = 265;
    playerPhysicalMessage._playerId = playerId;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(playerPhysicalMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
