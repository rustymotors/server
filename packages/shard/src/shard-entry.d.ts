export declare class ShardEntry {
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
    );
    /**
     * Return the entry in a formatted string
     *
     * @return {string}
     */
    formatForShardList(): string;
}
