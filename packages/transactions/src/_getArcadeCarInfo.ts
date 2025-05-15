import { OldServerMessage } from 'rusty-motors-shared';
import { ArcadeCarInfo, ArcadeCarMessage } from './ArcadeCarMessage.js';
import { GenericRequestMessage } from './GenericRequestMessage.js';
import type { MessageHandlerArgs, MessageHandlerResult } from './handlers.js';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('handlers/_getArcadeCarInfo');

/**
 * Handles an incoming arcade car info request and returns a response with predefined car information.
 *
 * Deserializes the incoming request, logs it, constructs a response message containing a single car (Bel-air, lobby 0), and returns it in the expected server message format.
 *
 * @returns An object containing the original {@link connectionId} and an array with the response message.
 */
export async function _getArcadeCarInfo({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getArcadeCarInfoMessage = new GenericRequestMessage();
    getArcadeCarInfoMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getArcadeCarInfoMessage.toString()}`);

    const arcadeCarInfoMessage = new ArcadeCarMessage();
    arcadeCarInfoMessage._msgNo = 323;

    const car1 = new ArcadeCarInfo();
    car1._brandedPartId = 113; // Bel-air
    car1._lobbyId = 0;
    arcadeCarInfoMessage.addCar(car1);

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(arcadeCarInfoMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
