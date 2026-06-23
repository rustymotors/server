import { MessageNode, RaceCreatedMessage } from "rusty-motors-shared";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger, CreateRaceMessage } from "rusty-motors-shared";

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

    log.debug(`createRaceMsg: ${createRaceMessage.toString()}`)
    
    // TODO Do stuff. Lots of stuff

    const raceCreatedMessage = new RaceCreatedMessage()
    raceCreatedMessage.raceId = 88
    raceCreatedMessage.entryFee = 5
    raceCreatedMessage.perPlayerPurseBonus = 20
    raceCreatedMessage.setPassword("Marty")
    raceCreatedMessage.raceHistoryId = 44
    raceCreatedMessage.perRacePurseBonus = 3


    log.debug(`RaceCreatedmsg: ${raceCreatedMessage.toString()}`)
    
    
    // Create new response packet
    const rPacket = new MessageNode();
    rPacket.sequence = packet.sequenceNumber;
    rPacket.setPayloadEncryption(true)

    rPacket.setBody(raceCreatedMessage)

    log.debug(`_createStandardRace: ${rPacket.toString()}`);

    return { connectionId, messages: [rPacket] };
}
