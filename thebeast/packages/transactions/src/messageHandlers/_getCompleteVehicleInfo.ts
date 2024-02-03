import { GenericRequestMessage } from "../GenericRequestMessage.js";

import { OldServerMessage } from "../../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "../handlers.js";
import { GenericReplyMessage } from "../GenericReplyMessage.js";
import { CarInfoMessage } from "../messageStructs/CarInfoMessage.js";
import { Vehicle } from "../../../database/src/models/Vehicle.entity.js";
import { Part } from "../../../database/src/models/Part.entity.js";

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

    try {
        const vehicle = await Vehicle.findOne({ where: { vehicleId } });

        if (!vehicle) {
            log.error(`Vehicle not found for vehicleId: ${vehicleId}`);
            throw new Error(`Vehicle not found for vehicleId: ${vehicleId}`);
        }

        const partId = 109;

        const parts = await Part.findOne({ where: { partId } });

        if (!parts) {
            log.error(`Part not found for partId: ${partId}`);
            throw new Error(`Part not found for partId: ${partId}`);
        }

        const response = new CarInfoMessage();
        response.msgNo = 123; // Success
        response.playerId = 1;
        response.setVehicle(vehicle);
        response.noOfParts = 1;
        response.setParts([parts]);


        const responsePacket = new OldServerMessage();
        responsePacket._header.sequence = packet._header.sequence;
        responsePacket._header.flags = 8;
        responsePacket.setBuffer(response.serialize());

        return { connectionId, messages: [responsePacket] };
    } catch (error) {
        log.error(`Error in Fetching car: ${error}`);
        throw error;
    }
}
