import { LoginCompleteMessage, TLoginMessage } from "./TLoginMessage.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { createNewCar } from "../../database/src/services/admin.js";
import {
    buildVehiclePartTree,
    saveVehicle,
    saveVehiclePartTree,
} from "../../database/src/models/VehiclePartTree.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function login({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    // Read the inbound packet
    const loginMessage = new TLoginMessage();
    loginMessage.deserialize(packet.serialize());
    log.debug(`Received LoginMessage: ${loginMessage.toString()}`);

    // Is this a new login?
    if (loginMessage._brandedPartId !== 0) {
        try {
            const personaId = loginMessage._personaId;
            const lotOwnerId = loginMessage._lotOwnerId;
            const brandedPartId = loginMessage._brandedPartId;
            const skinId = loginMessage._skinId;

            log.debug(
                `Creating new car for persona ${personaId} with brandedPartId ${brandedPartId} and skinId ${skinId} from lotOwnerId ${lotOwnerId}...`,
            );

            // Create new car
            const newCarPartTree = await buildVehiclePartTree({
                brandedPartId,
                skinId,
                ownerID: 1, // personaId,
                isStock: true,
            });
            await saveVehicle(newCarPartTree);
            await saveVehiclePartTree(newCarPartTree);

            const newCarOwnerId = newCarPartTree.vehicleId;

            log.debug(
                `Created new car with id ${newCarOwnerId} for persona ${personaId}`,
            );
        } catch (error) {
            log.error(`Error creating new car: ${error}`);
            throw error;
        }
    }

    // Create new response packet
    const pReply = new LoginCompleteMessage();
    pReply._msgNo = 213;
    pReply._firstTime = true;

    // Log the message
    log.debug(pReply.toString());

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;
    responsePacket.setBuffer(pReply.serialize());

    return { connectionId, messages: [responsePacket] };
}
