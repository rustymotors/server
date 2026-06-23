import { fetchStateFromDatabase, findSessionByConnectionId, ServerMessage, databaseProvider } from "rusty-motors-shared";
import type { MessageHandlerArgs, MessageHandlerResult } from './types.js';
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import { addVehicle } from "./_getOwnedVehicles.js";

import { getServerLogger } from "rusty-motors-shared";
import { PurchaseStockCarMessage } from './PurchaseStockCarMessage.js';

const defaultLogger = getServerLogger("handlers/_buyCarFromDealer");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _buyCarFromDealer({
	connectionId,
	packet,
	log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const purchaseStockCarMessage = new PurchaseStockCarMessage();
    purchaseStockCarMessage.deserialize(packet.serialize());

    log.debug(
        `[${connectionId}] Received PurchaseStockCarMessage: ${purchaseStockCarMessage.toString()}`,
    );

    const session = findSessionByConnectionId(
        fetchStateFromDatabase(),
        connectionId,
    );
    if (!session) {
        log.error(
            'Session not found',
            { connectionId }, 
        );
        throw new Error(`Session not found for connectionId: ${connectionId}`);
    }

    // TODO: Implement car purchase logic here
    // TODO: Get the new car ID from the database
    const gameDataStore = databaseProvider.getGameDataStore();
    const newCarId = await gameDataStore.purchaseCar(session.gameId, purchaseStockCarMessage.dealerId, purchaseStockCarMessage.brandedPardId, purchaseStockCarMessage.skinId, purchaseStockCarMessage.tradeInCarId)
    .then((newCarId) => {
        log.debug(
            'Purchased car',
            { connectionId }, 
        );
        return newCarId;
    })
    .catch((error) => {
        log.error(
            'Failed to purchase car',
            { connectionId, error },
            );
        throw new Error('Failed to purchase car');
    })

    log.debug(
        `[${connectionId}] Purchased car with ID: ${newCarId}`,
    );

    // For now, just add a new car to the player's inventory
    addVehicle(
        session.gameId,
        1000,
        purchaseStockCarMessage.brandedPardId,
        purchaseStockCarMessage.skinId,
    );

    const replyPacket = new GenericReplyMessage();
    replyPacket.msgNo = 103; // GenericReplyMessage
    replyPacket.msgReply = 142; // PurchaseStockCarMessage
    replyPacket.result.writeUInt32LE(101, 0); // MC_SUCCESS
    const dataBuffer = Buffer.alloc(4);
    dataBuffer.writeUInt32LE(newCarId, 0);
    replyPacket.setData(dataBuffer);

    log.debug(
        `[${connectionId}] Sending GenericReplyMessage: ${replyPacket.toString()}`,
    );

    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(replyPacket.serialize());

    log.debug(
        `[${connectionId}] Sending response packet: ${responsePacket.toHexString()}`,
    );

    return { connectionId, messages: [responsePacket] };
}