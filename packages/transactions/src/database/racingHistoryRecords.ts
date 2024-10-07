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
const racingHistoryRecords: Map<number, RacingHistoryRecord[]> = new Map();

racingHistoryRecords.set(2868969472, [
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
]);

/**
 * Retrieves the racing history records for a given customer.
 *
 * @param customerId - The unique identifier of the customer.
 * @returns The racing history records for the customer.
 */
export function getRacingHistoryRecords(
	customerId: number,
): RacingHistoryRecord[] {
	return racingHistoryRecords.get(customerId) ?? [];
}

/**
 * Sets the racing history records for a given customer.
 *
 * @param customerId - The unique identifier of the customer.
 * @param records - An array of racing history records to be associated with the customer.
 */
export function setRacingHistoryRecords(
	customerId: number,
	records: RacingHistoryRecord[],
): void {
	racingHistoryRecords.set(customerId, records);
}
