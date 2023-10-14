import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { ServerMessage } from "../../shared/messageFactory.js";
import {
    PlayerRacingHistoryMessage,
    RacingHistoryRecordEntry,
} from "./PlayerRacingHistoryMessage.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

export enum RaceType {
    RACES_TESTDRIVE = 14,
    RACES_SIM_STREET = 16,
    RACES_SIM_PRO = 17,
    RACES_SIM_DRAG = 18,
    RACES_SIM_TIMETRIAL = 19,

    RACES_ARC_STUNT = 23,
    RACES_ARC_TIMETRIAL = 25,
    RACES_TRADEWINDOW = 26,
}

export type RacingHistoryRecord = {
    raceType: RaceType; // 4 bytes
    numberOfRacesEntered: number; // 4 bytes
    numberOfRacesFinished: number; // 4 bytes
    numberOfRacesWon: number; // 4 bytes
    numberOfCarsWon: number; // 4 bytes
    numberOfCarsLost: number; // 4 bytes
    numberOfChampionshipsWon: number; // 4 bytes
    cashWon: number; // 4 bytes
};
const racingHistoryRecords: RacingHistoryRecord[] = [
    {
        raceType: RaceType.RACES_TESTDRIVE,
        numberOfRacesEntered: 0,
        numberOfRacesFinished: 0,
        numberOfRacesWon: 0,
        numberOfCarsWon: 0,
        numberOfCarsLost: 0,
        numberOfChampionshipsWon: 0,
        cashWon: 0,
    },
];

export async function _getPlayerRaceHistory({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getPlayerRaceHistoryMessage = new GenericRequestMessage();
    getPlayerRaceHistoryMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getPlayerRaceHistoryMessage.toString()}`);

    const outgoingMessage = new PlayerRacingHistoryMessage();
    outgoingMessage._msgId = 362;

    for (const record of racingHistoryRecords) {
        const recordEntry = new RacingHistoryRecordEntry();
        recordEntry.raceType = record.raceType;
        recordEntry.numberOfRacesEntered = record.numberOfRacesEntered;
        recordEntry.numberOfRacesFinished = record.numberOfRacesFinished;
        recordEntry.numberOfRacesWon = record.numberOfRacesWon;
        recordEntry.numberOfCarsWon = record.numberOfCarsWon;
        recordEntry.numberOfCarsLost = record.numberOfCarsLost;
        recordEntry.numberOfChampionshipsWon = record.numberOfChampionshipsWon;
        recordEntry.cashWon = record.cashWon;

        outgoingMessage.addRecord(recordEntry);
    }

    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(outgoingMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
