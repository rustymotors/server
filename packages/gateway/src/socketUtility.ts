import type { Socket as UdpSocket } from "node:dgram";
import type { Socket as TcpSocket } from "node:net";
import type { ServerLogger, TaggedSocket } from "rusty-motors-shared";



export type ConnectionContext = {
	connectionId: string;
	connectedStamp: number;
	personaId: number;
	isEncrypted: boolean;
	logger: ServerLogger;
};

export function createConnectionContext() {}


/**
 * Tags a socket with an ID and a connection timestamp.
 *
 * @param socket - The socket to be tagged.
 * @param connectedAt - The timestamp of the connection.
 * @param connectionId - The unique identifier to tag the socket with.
 * @returns An object containing the id, socket, and connectionStamp.
 */

export function tagSocket(
	socket: TcpSocket | UdpSocket,
	connectedAt: number,
	connectionId: string,
	localPort: number
): TaggedSocket {
	return {
		connectionId,
		socket,
		connectedAt,
		localPort
	} as TaggedSocket;
}

/**
 * Attempts to write data to a socket and returns a promise that resolves when the write is successful,
 * or rejects if an error occurs during the write operation.
 *
 * @param socket - The tagged socket to which the data will be written.
 * @param data - The string data to be written to the socket.
 * @returns A promise that resolves when the data is successfully written, or rejects with an error if the write fails.
 */
export async function trySocketWrite(socket: TaggedSocket, data: string): Promise<void> {
	return new Promise((resolve, reject) => {
		// Ensure the socket has a 'write' method before attempting to write.
		if (!('write' in socket.socket)) {
			return reject(new Error('You attempted to call write on a non-TCP socket!'));
		}
		(socket.socket as TcpSocket).write(data, (error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}


