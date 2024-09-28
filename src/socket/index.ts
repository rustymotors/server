import type { Socket } from "net";
import { ConnectedSocket_ } from "./ConnectedSocket.js";
import type { ConnectedSocket } from "./ConnectedSocket.js";
export type { ConnectedSocket } from "./ConnectedSocket.js";

const sockets = new Map<string, ConnectedSocket>();

/**
 * Establishes a new socket connection and manages data flow between the socket and a connected socket.
 *
 * @param socket - The socket instance to be connected.
 * @returns A `ConnectedSocket` instance that represents the connected socket.
 *
 * The function performs the following actions:
 * - Creates a new `ConnectedSocket` instance.
 * - Stores the `ConnectedSocket` instance in a `sockets` map using its ID.
 * - Listens for data events on the provided socket and appends the received data to the `ConnectedSocket`'s data buffer.
 * - Listens for the close event on the provided socket and removes the `ConnectedSocket` from the `sockets` map.
 * - Listens for data events on the `ConnectedSocket` and writes the data back to the provided socket.
 */
export function newSocket(socket: Socket): ConnectedSocket {
	const connectedSocket = new ConnectedSocket_() as ConnectedSocket;
	sockets.set(connectedSocket.id, connectedSocket);
	socket.on("data", (data) => {
		connectedSocket.data = data;
	});
	socket.on("close", () => {
		sockets.delete(connectedSocket.id);
	});
	connectedSocket.on("data", (data) => {
		socket.write(data);
	});
	return connectedSocket;
}

/**
 * Retrieves a connected socket by its unique identifier.
 *
 * @param id - The unique identifier of the socket to retrieve.
 * @returns The connected socket associated with the given identifier, or `undefined` if no socket is found.
 */
export function getSocket(id: string): ConnectedSocket | undefined {
	return sockets.get(id);
}
