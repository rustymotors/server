import { OldServerMessage } from "rusty-motors-shared";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";
import { CreateRaceMessage } from "../../shared/src/MessageNode.js";

const defaultLogger = getServerLogger("handlers/_createStandardRace");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _createStandardRace({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    
    const createRaceMessage = new CreateRaceMessage()
    createRaceMessage.deserialize(packet.serialize())
    
    
    
    
    // Create new response packet
    const pReply = new GenericReplyMessage();
    pReply.msgNo = 101;
    pReply.msgReply = 163;
    const rPacket = new OldServerMessage();
    rPacket._header.sequence = packet.sequenceNumber;
    rPacket._header.flags = 8;

    rPacket.setBuffer(pReply.serialize());

    log.debug(`_createStandardRace: ${rPacket.toString()}`);

    return { connectionId, messages: [] };
}
