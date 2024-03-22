import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { OldServerMessage } from "@rustymotors/shared";
import { OwnedVehicle, OwnedVehiclesMessage } from "./OwnedVehiclesMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";

const vehicleList = [
    {
        personId: 1000,
        vehicleId: 2,
        brandedPartId: 113,
    },
];

export function getVehiclesForPerson(personId: number) {
    return vehicleList.filter((vehicle) => vehicle.personId === personId);
}

export async function _getOwnedVehicles(
    args: MessageHandlerArgs,
): Promise<MessageHandlerResult> {
    const getOwnedVehiclesMessage = new GenericRequestMessage();
    getOwnedVehiclesMessage.deserialize(args.packet.data);

    args.log.debug(`Received Message: ${getOwnedVehiclesMessage.toString()}`);

    const personId = getOwnedVehiclesMessage.data.readUInt32LE(0);

    const ownedVehiclesMessage = new OwnedVehiclesMessage();

    const vehicles = getVehiclesForPerson(personId);

    for (const vehicle of vehicles) {
        const ownedVehicle = new OwnedVehicle();
        ownedVehicle._vehicleId = vehicle.vehicleId;
        ownedVehicle._brandedPartId = vehicle.brandedPartId;
        ownedVehiclesMessage.addVehicle(ownedVehicle);
    }

    ownedVehiclesMessage._msgNo = 173;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = args.packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(ownedVehiclesMessage.serialize());

    return { connectionId: args.connectionId, messages: [responsePacket] };
}
