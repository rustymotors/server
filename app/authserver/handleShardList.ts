import { IncomingMessage, ServerResponse } from "node:http";

export class ShardEntry {
	name: string;
	description: string;
	id: number;
	loginServerIp: string;
	loginServerPort: number;
	lobbyServerIp: string;
	lobbyServerPort: number;
	mcotsServerIp: string;
	statusId: number;
	statusReason: string;
	serverGroupName: string;
	population: number;
	maxPersonasPerUser: number;
	diagnosticServerHost: string;
	diagnosticServerPort: number;
	/**
	 *
	 * @param {string} name
	 * @param {string} description
	 * @param {number} id
	 * @param {string} loginServerIp
	 * @param {number} loginServerPort
	 * @param {string} lobbyServerIp
	 * @param {number} lobbyServerPort
	 * @param {string} mcotsServerIp
	 * @param {number} statusId
	 * @param {string} statusReason
	 * @param {string} serverGroupName
	 * @param {number} population
	 * @param {number} maxPersonasPerUser
	 * @param {string} diagnosticServerHost
	 * @param {number} diagnosticServerPort
	 */
	constructor(
		name: string,
		description: string,
		id: number,
		loginServerIp: string,
		loginServerPort: number,
		lobbyServerIp: string,
		lobbyServerPort: number,
		mcotsServerIp: string,
		statusId: number,
		statusReason: string,
		serverGroupName: string,
		population: number,
		maxPersonasPerUser: number,
		diagnosticServerHost: string,
		diagnosticServerPort: number,
	) {
		this.name = name;
		this.description = description;
		this.id = id;
		this.loginServerIp = loginServerIp;
		this.loginServerPort = loginServerPort;
		this.lobbyServerIp = lobbyServerIp;
		this.lobbyServerPort = lobbyServerPort;
		this.mcotsServerIp = mcotsServerIp;
		this.statusId = statusId;
		this.statusReason = statusReason;
		this.serverGroupName = serverGroupName;
		this.population = population;
		this.maxPersonasPerUser = maxPersonasPerUser;
		this.diagnosticServerHost = diagnosticServerHost;
		this.diagnosticServerPort = diagnosticServerPort;
	}

	/**
	 * Return the entry in a formatted string
	 *
	 * @return {string}
	 */
	formatForShardList(): string {
		return `[${this.name}]
      Description=${this.description}
      ShardId=${this.id}
      LoginServerIP=${this.loginServerIp}
      LoginServerPort=${this.loginServerPort}
      LobbyServerIP=${this.lobbyServerIp}
      LobbyServerPort=${this.lobbyServerPort}
      MCOTSServerIP=${this.mcotsServerIp}
      StatusId=${this.statusId}
      Status_Reason=${this.statusReason}
      ServerGroup_Name=${this.serverGroupName}
      Population=${this.population}
      MaxPersonasPerUser=${this.maxPersonasPerUser}
      DiagnosticServerHost=${this.diagnosticServerHost}
      DiagnosticServerPort=${this.diagnosticServerPort}`;
	}
}

function generateShardList() {
	const SHARD_HOST = "rusty-motors.com"

	const shardClockTower = new ShardEntry(
		"The Clocktower",
		"The Clocktower",
		44,
		SHARD_HOST,
		8226,
		SHARD_HOST,
		7003,
		SHARD_HOST,
		0,
		"",
		"Group-1",
		88,
		2,
		SHARD_HOST,
		80,
	);

	let _possibleShards: string[] = [];
	_possibleShards.push(shardClockTower.formatForShardList());

	const shardTwinPinesMall = new ShardEntry(
		"Twin Pines Mall",
		"Twin Pines Mall",
		88,
		SHARD_HOST,
		8226,
		SHARD_HOST,
		7003,
		SHARD_HOST,
		0,
		"",
		"Group-1",
		88,
		2,
		SHARD_HOST,
		80,
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

export function handleShardList(request: IncomingMessage, response: ServerResponse) {
	this.log.info("Handling ShardList request");
	// Implement shard list retrieval logic here
	const shardList = generateShardList();
	response.setHeader("Content-Type", "text/plain");
	response.writeHead(200);
	response.end(shardList);
}
