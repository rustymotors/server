// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { type Server, type Socket as TcpSocket, createServer as createSocketServer } from "node:net";
import { createSocket, type RemoteInfo, type Socket as UdpSocket } from "node:dgram";
import type { ServerLogger } from "rusty-motors-shared";

/**
 * Represents a network server (TCP or UDP)
 */
export interface NetworkServer {
	port: number;
	server: Server | UdpSocket;
	type: "tcp" | "udp";
}

/**
 * Handler for TCP socket connections
 */
export type SocketConnectionHandler = (params: {
	incomingSocket: TcpSocket;
}) => void;

/**
 * Handler for UDP messages
 */
export type UdpMessageHandler = (
	message: Buffer<ArrayBufferLike>,
	rinfo: RemoteInfo,
) => void;

/**
 * Interface for network server management
 */
export interface INetworkServerManager {
	startTcpServer(
		port: number,
		handler: SocketConnectionHandler,
	): Promise<Server>;
	startUdpServer(port: number, handler: UdpMessageHandler): Promise<UdpSocket>;
	shutdownAll(): Promise<void>;
	getActiveServers(): NetworkServer[];
}

/**
 * Manages TCP and UDP network servers
 *
 * This class handles the creation, lifecycle, and shutdown of TCP and UDP servers.
 * It tracks all active servers and provides methods to start and stop them.
 */
export class NetworkServerManager implements INetworkServerManager {
	private readonly tcpServers: Map<number, Server> = new Map();
	private readonly udpSockets: Map<number, UdpSocket> = new Map();
	private readonly log: ServerLogger;
	private readonly backlogAllowedCount: number;

	constructor(log: ServerLogger, backlogAllowedCount: number = 0) {
		this.log = log;
		this.backlogAllowedCount = backlogAllowedCount;
	}

	/**
	 * Starts a TCP server on the specified port
	 *
	 * @param port - The port number to listen on
	 * @param handler - The connection handler function
	 * @returns A promise that resolves to the Server instance
	 * @throws {Error} If a server is already running on the port
	 */
	async startTcpServer(
		port: number,
		handler: SocketConnectionHandler,
	): Promise<Server> {
		if (this.tcpServers.has(port)) {
			throw new Error(`TCP server already running on port ${port}`);
		}

		const server = createSocketServer((socket) => {
			handler({ incomingSocket: socket });
		});

		return new Promise((resolve, reject) => {
			server.listen(port, "0.0.0.0", this.backlogAllowedCount, () => {
				this.tcpServers.set(port, server);
				this.log.info(`TCP server listening on port ${port}`);
				resolve(server);
			});

			server.on("error", (error) => {
				this.log.error(`TCP server error on port ${port}: ${error.message}`);
				this.tcpServers.delete(port);
				reject(error);
			});
		});
	}

	/**
	 * Starts a UDP socket on the specified port
	 *
	 * @param port - The port number to bind to
	 * @param handler - The message handler function that receives (message, rinfo, socket)
	 * @returns A promise that resolves to the UdpSocket instance
	 * @throws {Error} If a socket is already bound to the port
	 */
	async startUdpServer(
		port: number,
		handler: UdpMessageHandler,
	): Promise<UdpSocket> {
		if (this.udpSockets.has(port)) {
			throw new Error(`UDP socket already bound to port ${port}`);
		}

		const socket = createSocket("udp4");

		// Set up message handler that includes the socket
		socket.on("message", (message: Buffer<ArrayBufferLike>, rinfo: RemoteInfo) => {
			handler(message, rinfo);
		});

		return new Promise((resolve, reject) => {
			socket.on("listening", () => {
				this.udpSockets.set(port, socket);
				this.log.info(`UDP socket bound to port ${port}`);
				resolve(socket);
			});

			socket.on("error", (error) => {
				this.log.error(`UDP socket error on port ${port}: ${error.message}`);
				this.udpSockets.delete(port);
				reject(error);
			});

			socket.bind(port);
		});
	}

	/**
	 * Shuts down all TCP servers and UDP sockets
	 *
	 * @returns A promise that resolves when all servers are closed
	 */
	async shutdownAll(): Promise<void> {
		const shutdownPromises: Promise<void>[] = [];

		// Close all TCP servers
		for (const [port, server] of this.tcpServers.entries()) {
			shutdownPromises.push(
				new Promise<void>((resolve) => {
					server.close(() => {
						this.log.debug(`TCP server on port ${port} closed`);
						resolve();
					});
				}),
			);
		}

		// Close all UDP sockets
		for (const [port, socket] of this.udpSockets.entries()) {
			shutdownPromises.push(
				new Promise<void>((resolve) => {
					socket.close(() => {
						this.log.debug(`UDP socket on port ${port} closed`);
						resolve();
					});
				}),
			);
		}

		await Promise.all(shutdownPromises);
		this.tcpServers.clear();
		this.udpSockets.clear();
	}

	/**
	 * Gets all active servers (TCP and UDP)
	 *
	 * @returns An array of NetworkServer objects representing all active servers
	 */
	getActiveServers(): NetworkServer[] {
		const servers: NetworkServer[] = [];

		for (const [port, server] of this.tcpServers.entries()) {
			servers.push({ port, server, type: "tcp" });
		}

		for (const [port, socket] of this.udpSockets.entries()) {
			servers.push({ port, server: socket, type: "udp" });
		}

		return servers;
	}
}
