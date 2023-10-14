import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { StockCarInfoMessage } from "./StockCarInfoMessage.js";
import { StockCar } from "./StockCar.js";
import { ServerMessage } from "../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _getStockCarInfo({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getStockCarInfoMessage = new GenericRequestMessage();
    getStockCarInfoMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getStockCarInfoMessage.toString()}`);

    const stockCarInfoMessage = new StockCarInfoMessage(200, 0, 105);
    stockCarInfoMessage.starterCash = 200;
    stockCarInfoMessage.dealerId = 8;
    stockCarInfoMessage.brand = 105;

    stockCarInfoMessage.addStockCar(new StockCar(113, 20, false)); // Bel-air
    stockCarInfoMessage.addStockCar(new StockCar(104, 15, true)); // Fairlane - Deal of the day
    stockCarInfoMessage.addStockCar(new StockCar(402, 20, false)); // Century

    log.debug(`Sending Message: ${stockCarInfoMessage.toString()}`);

    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence + 1;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(stockCarInfoMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
