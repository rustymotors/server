import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { LoginCompleteMessage, TLoginMessage } from "./TLoginMessage.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { VehicleModel } from "./models/VehicleModel.js";
import { createVehicle } from "./services/car.js";
import { Vehicle } from "../../database/src/models/Vehicle.entity.js";

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
        // Create a new vehicle
        const vehicle = await Vehicle.upsert({
            skinId: loginMessage._skinId,
            flags: 0,
            delta: 0,
            carClass: 3,
            damageLength: 0,
            damage: 0,
        });
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
