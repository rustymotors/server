import { JoinRaceMessage, MessageNode, RaceJoinedMessage } from "rusty-motors-shared";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_joinRace");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _joinRace({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    
    const joinRaceMessage = new JoinRaceMessage()
    joinRaceMessage.deserialize(packet.data)

    log.debug(`JoinRaceMsg: ${joinRaceMessage.toString()}`)
    
    // TODO Do stuff. Lots of stuff

    const raceJoinedMessage = new RaceJoinedMessage()
    raceJoinedMessage.raceId = 88
    raceJoinedMessage.setPassword("Marty")


    log.debug(`RaceJoinedMsg: ${raceJoinedMessage.toString()}`)
    
    
    // Create new response packet
    const rPacket = new MessageNode();
    rPacket.sequence = packet.sequenceNumber;
    rPacket.setPayloadEncryption(true)

    rPacket.setBody(raceJoinedMessage)

    log.debug(`_joinRace: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}
