import type { RoomServer } from "@rustymotors/roomserver";

const roomServers: Set<RoomServer> = new Set();
/**
 * Adds a room server to the set of room servers.
 *
 * @param roomServer - The room server to add.
 */
export function addRoomServer(roomServer: RoomServer): void {
	roomServers.add(roomServer);
}

/**
 * Gets a room server by its port.
 *
 * @param port - The port of the room server to get.
 * @returns The room server with the specified port, or undefined if no room server has that port.
 */
export function getRoomServerByPort(port: number): RoomServer | undefined {
    return Array.from(roomServers).find((server) => server.port === port);
}

/**
 * Gets a room server by its name.
 * 
 * @param name - The name of the room server to get.
 * @returns The room server with the specified name, or undefined if no room server has that name.
 */
export function getRoomServerByName(name: string): RoomServer | undefined {
    return Array.from(roomServers).find((server) => server.name === name);
}

/**
 * Gets a room server by its id.
 * 
 * @param id - The id of the room server to get.
 * @returns The room server with the specified id, or undefined if no room server has that id.
 */
export function getRoomServerById(id: number): RoomServer | undefined {
    return Array.from(roomServers).find((server) => server.id === id);
}
