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

import {
	type OnDataHandler,
	type ServerLogger,
	type ServiceResponse,
	fetchStateFromDatabase,
	getOnDataHandler,
} from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { newSocket, type ConnectedSocket } from "rusty-motors-socket";

import { Socket } from "node:net";
import { getGatewayServer } from "./GatewayServer.js";
import { getPortMessageType, UserStatusManager } from "rusty-motors-nps";
import { BasePacket } from "rusty-motors-shared-packets";
import * as Sentry from "@sentry/node";
import { socketErrorHandler } from "./socketErrorHandler.js";

/**
 * Handle the end of a socket connection
 *
 * @param {object} options
 * @param {string} options.connectionId The connection ID
 * @param {import("pino").Logger} [options.log=getServerLogger({ name: "socketEndHandler" })] The logger to use
 */
// export function socketEndHandler({
// 	connectionId,
// 	log = getServerLogger({
// 		name: "socketEndHandler",
// 	}),
// }: {
// 	connectionId: string;
// 	log?: ServerLogger;
// }) {
// 	log.debug(`Connection ${connectionId} ended`);

// 	// Remove the socket from the global state
// 	removeSocket(fetchStateFromDatabase(), connectionId).save();
// }

/**
 * Handle incoming TCP connections
 *
 * @param {object} options
 * @param {Socket} options.incomingSocket The incoming socket
 * @param {Logger} [options.log=getServerLogger({ name: "onDataHandler" })] The logger to use
 *
 */
export function onSocketConnection({
	incomingSocket,
	log = getServerLogger({
		name: "onDataHandler",
	}),
}: {
	incomingSocket: Socket;
	log?: ServerLogger;
}) {
	// Get the local port and remote address
	const { localPort, remoteAddress } = incomingSocket;

	if (localPort === undefined || remoteAddress === undefined) {
		throw Error("localPort or remoteAddress is undefined");
	}

	const socket = newSocket(incomingSocket);

	// =======================
	// Handle incoming socket in shadow mode
	// =======================

	try {
		// Get expected message type
		const messageType = getPortMessageType(localPort);
		log.debug(`[${socket.id}] Expected message type: ${messageType}`);

		switch (messageType) {
			case "Game": {
				// Handle game messages
				// Create a new user status
				const userStatus = UserStatusManager.newUserStatus();
				log.debug(`[${socket.id}] Created new user status`);

				UserStatusManager.addUserStatus(userStatus);
				log.debug(`[${socket.id}] Added user status to manager`);

				break;
			}

			case "Server": {
				// Handle server messages
				break;
			}

			default: {
				log.warn(`[${socket.id}] No message type found`);
				break;
			}
		}
	} catch (error) {
		log.error(`[${socket.id}] Error handling socket: ${error}`);
	}



	socket.on("error", (error) =>
		socketErrorHandler({ connectionId: socket.id, error }),
	);

	// Add the data handler to the socket
	socket.on("inData", (data) => {
		socketDataHandler(socket, data, log);
	});

	log.debug(
		`[${socket.id}] Socket connection established on port ${localPort} from ${remoteAddress}`,
	);

	if (localPort === 7003) {
		// Sent ok to login packet
		socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
	}
}

function socketDataHandler(
	socket: ConnectedSocket,
	incomingDataAsBuffer: Buffer,
	log: ServerLogger,
) {
	log.trace(
		`[${socket.id}] Received data: ${incomingDataAsBuffer.toString("hex")}`,
	);

		// This is a new TCP socket, so it's probably not using HTTP
	// Let's look for a port onData handler
	/** @type {OnDataHandler | undefined} */
	const portOnDataHandler: OnDataHandler | undefined = getOnDataHandler(
		fetchStateFromDatabase(),
		socket.port,
	);

	// If there is no onData handler, log a warning and return
	if (!portOnDataHandler) {
		log.warn(`[${socket.id}] No onData handler found for port ${socket.port}`);
		log.warn(`[${socket.id}] Received data: ${socket.peek().toString("hex")}`);
		return;
	}

	// Deserialize the raw message
	const rawMessage = new BasePacket({
		connectionId: socket.id,
		messageId: 0,
		messageSequence: 0,
		messageSource: "",
	});
	rawMessage.deserialize(incomingDataAsBuffer);

	// Log the raw message
	log.trace(`[${socket.id}] Raw message: ${rawMessage.toHexString()}`);

	log.debug(`[${socket.id}] Handling data with ${portOnDataHandler.name}`);

	Sentry.startSpan(
		{
			name: "onDataHandler",
			op: "onDataHandler",
		},
		async () => {
			portOnDataHandler({
				connectionId: socket.id,
				message: rawMessage,
			})
				.then((response: ServiceResponse) => {
					log.debug(
						`[${socket.id}] Data handler returned with ${response.messages.length} messages`,
					);
					const { messages } = response;

					// Log the messages
					log.trace(
						`[${socket.id}] Messages: ${messages.map((m) => m.toString()).join(", ")}`,
					);

					// Serialize the messages
					const serializedMessages = messages.map((m) => m.serialize());

					try {
						// Send the messages
						serializedMessages.forEach((m) => {
							socket.write(m);
							log.trace(`[${socket.id}] Sent message: ${m.toString("hex")}`);
						});
					} catch (error) {
						const err = new Error(
							`[${socket.id}] Error sending messages: ${(error as Error).message}`,
							{ cause: error },
						);
						throw err;
					}
				})
				.catch((error: Error) => {
					const err = new Error(`[${socket.id}] Error in onData handler: ${error.message}`, {
						cause: error,
					});
					log.fatal(`${err.message}`);
					const id = Sentry.captureException(err);
					console.trace(error);
					log.fatal(`Sentry event ID: ${id}`);
					void getGatewayServer({}).stop();
					Sentry.flush(200).then(() => {
						log.debug("Sentry flushed");
						// Call server shutdown
						void getGatewayServer({}).shutdown();
					});
				});
		},
	);
}
