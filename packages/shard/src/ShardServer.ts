import { ShardEntry } from "./shard-entry.js";

/**
 * Generate a shard list web document
 *
 * @param {string} shardHost - The host address for the shard server
 * @param {number} loginServerPort - The port for the login server (default: 8226)
 * @param {number} lobbyServerPort - The port for the lobby server (default: 7003)
 * @param {number} diagnosticServerPort - The port for the diagnostic server (default: 80)
 */
export function generateShardList(
	shardHost: string,
	loginServerPort: number = 8226,
	lobbyServerPort: number = 7003,
	diagnosticServerPort: number = 80,
) {
	const shardClockTower = new ShardEntry(
		"The Clocktower",
		"The Clocktower",
		44,
		shardHost,
		loginServerPort,
		shardHost,
		lobbyServerPort,
		shardHost,
		0,
		"",
		"Group-1",
		88,
		2,
		shardHost,
		diagnosticServerPort,
	);

	const _possibleShards: string[] = [];
	_possibleShards.push(shardClockTower.formatForShardList());

	const shardTwinPinesMall = new ShardEntry(
		"Twin Pines Mall",
		"Twin Pines Mall",
		88,
		shardHost,
		loginServerPort,
		shardHost,
		lobbyServerPort,
		shardHost,
		0,
		"",
		"Group-1",
		88,
		2,
		shardHost,
		diagnosticServerPort,
	);

	_possibleShards.push(shardTwinPinesMall.formatForShardList());

	/** @type {string[]} */
	const activeShardList: string[] = [];

	if (_possibleShards.length === 0) {
		throw new Error("No shards found");
	}

	activeShardList.push(_possibleShards[0]!);

	return activeShardList.join("\n");
}
