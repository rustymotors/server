import { ServerMessage } from "@rustymotors/shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import {
    PlayerRacingHistoryMessage,
    RacingHistoryRecordEntry,
} from "./PlayerRacingHistoryMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";

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

    const playerId = getPlayerRaceHistoryMessage.data.readInt32LE(0);

    log.debug(`Player ID: ${playerId}`);

    const playerRacingHistoryMessage = new PlayerRacingHistoryMessage();
    playerRacingHistoryMessage._msgId = 362;
    playerRacingHistoryMessage._userId = playerId;

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

        playerRacingHistoryMessage.addRecord(recordEntry);
    }

    const responsePacket = new ServerMessage(
        packet._header.sequence,
        8,
        playerRacingHistoryMessage.serialize(),
    );

    log.debug(`Sending Message: ${playerRacingHistoryMessage.toString()}`);

    return { connectionId, messages: [responsePacket] };
}
