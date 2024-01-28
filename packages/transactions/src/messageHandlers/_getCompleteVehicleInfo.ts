import { GenericRequestMessage } from "../GenericRequestMessage.js";
import { OldServerMessage } from "../../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "../handlers.js";

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

    const vehicleId = getCompleteVehicleInfoMessage.data.readInt32BE();
    const delta = getCompleteVehicleInfoMessage.data2.readInt32BE();

    log.debug(`Requesting vehicleId: ${vehicleId} delta: ${delta}`);


    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    return { connectionId, messages: [responsePacket] };
}
