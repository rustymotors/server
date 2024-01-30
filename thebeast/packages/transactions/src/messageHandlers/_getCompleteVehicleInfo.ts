import { GenericRequestMessage } from "../GenericRequestMessage.js";

import { OldServerMessage } from "../../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "../handlers.js";
import { GenericReplyMessage } from "../GenericReplyMessage.js";
import { CarInfoMessage } from "../messageStructs/CarInfoMessage.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _getCompleteVehicleInfo({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getCompleteVehicleInfoMessage = new GenericRequestMessage();
    getCompleteVehicleInfoMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getCompleteVehicleInfoMessage.toString()}`);

    const vehicleId = getCompleteVehicleInfoMessage.data.readInt32LE();
    const delta = getCompleteVehicleInfoMessage.data2.readInt32LE();

    log.debug(`Requesting vehicleId: ${vehicleId} delta: ${delta}`);

    const response = new CarInfoMessage();
    response.msgNo = 123; // Success

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;
    responsePacket.setBuffer(response.serialize());

    return { connectionId, messages: [responsePacket] };
}
