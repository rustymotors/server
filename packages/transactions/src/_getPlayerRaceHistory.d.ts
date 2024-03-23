import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";
export declare enum RaceType {
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
    raceType: RaceType;
    numberOfRacesEntered: number;
    numberOfRacesFinished: number;
    numberOfRacesWon: number;
    numberOfCarsWon: number;
    numberOfCarsLost: number;
    numberOfChampionshipsWon: number;
    cashWon: number;
};
export declare function _getPlayerRaceHistory({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult>;
