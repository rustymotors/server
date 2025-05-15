import { OldServerMessage } from 'rusty-motors-shared';
import { GenericRequestMessage } from './GenericRequestMessage.js';
import { OwnedVehicle, OwnedVehiclesMessage } from './OwnedVehiclesMessage.js';
import type { MessageHandlerArgs, MessageHandlerResult } from './handlers.js';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('handlers/_getOwnedVehicles');

const vehicleList = [
    {
        personId: 1,
        vehicleId: 1,
        brandedPartId: 113,
    },
];

/**
 * Retrieves all vehicles owned by the specified person.
 *
 * @param personId - The unique identifier of the person whose vehicles are to be retrieved.
 * @returns An array of vehicle records associated with the given {@link personId}.
 */
export function getVehiclesForPerson(personId: number) {
    return vehicleList.filter((vehicle) => vehicle.personId === personId);
}

/**
 * Handles a request to retrieve all vehicles owned by a specific person and returns them in a response message.
 *
 * Processes the incoming packet to extract the person ID, gathers the associated vehicles, constructs an owned vehicles message, and returns it as a response packet.
 *
 * @returns An object containing the {@link connectionId} and an array with the response packet listing the owned vehicles.
 */
export async function _getOwnedVehicles({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getOwnedVehiclesMessage = new GenericRequestMessage();
    getOwnedVehiclesMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getOwnedVehiclesMessage.toString()}`);

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
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(ownedVehiclesMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
