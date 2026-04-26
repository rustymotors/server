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

import type { Socket as TcpSocket } from "node:net";
import type { RemoteInfo, Socket as UdpSocket } from "node:dgram";
import { randomUUID } from "node:crypto";
import { tagSocket } from "./socketUtility.js";
import { getPortRouter } from "./portRouters.js";
import * as Sentry from "@sentry/node";
import {
    getServerLogger,
    type ServerLogger,
    type TaggedTcpSocket,
} from "rusty-motors-shared";
import { socketErrorHandler } from "./socketErrorHandler.js";
import { getSessionRecorder } from "./session/SessionRecorderIntegration.js";

const ALLOWED_IPS = [
    "98.231.127.157", // Mark's IP for testing
    "10.10.5.1", // Local IP for testing
    "181.169.157.11", // Ziimbiian's IP for testing
    "79.242.19.80", // Lacnr's IP for testing
];

/**
 * Handle incoming TCP connections
 *
 * @param {object} options
 * @param {TcpSocket} options.incomingSocket The incoming socket
 * @param {Logger} [options.log=getServerLogger({ name: "onDataHandler" })] The logger to use
 *
 */
export function onSocketConnection({
    incomingSocket,
    log = getServerLogger("gateway"),
}: {
    incomingSocket: TcpSocket;
    log?: ServerLogger;
}) {
    // Attach error handler immediately before any other logic to prevent
    // unhandled error events from crashing the server (e.g. ECONNRESET
    // already pending when localPort/remoteAddress is undefined)
    let id = `${randomUUID()}`;
    id = id.substring(0, id.indexOf("-"));
    incomingSocket.on("error", (error) => {
        socketErrorHandler({ connectionId: id, error, log });
    });

    // Get the local port and remote address
    const { localPort, remoteAddress } = incomingSocket;

    // If the local port or remote address is undefined, close and return
    if (localPort === undefined || remoteAddress === undefined) {
        log.error("localPort or remoteAddress is undefined. Closing socket.");
        if (!incomingSocket.destroyed) {
            incomingSocket.end();
        }
        return;
    }

    id = `${id}:${localPort}`;

    if (!ALLOWED_IPS.includes(remoteAddress)) {
        incomingSocket.destroy();
        return;
    }

    const socketWithId = tagSocket(
        incomingSocket,
        Date.now(),
        id,
        localPort,
    ) as TaggedTcpSocket;

    // Record session start if recording is enabled
    const recorder = getSessionRecorder();
    if (recorder?.isRecordingEnabled()) {
        recorder.startSession(id, localPort, remoteAddress);
    }

    const baseId = id.split(":")[0];
    log.info(
        `[${baseId}] Connected from ${remoteAddress} on port ${localPort}`,
    );

    const portRouter = getPortRouter(localPort);

    // Hand the socket to the port router, passing the logger
    portRouter({ taggedSocket: socketWithId, log }).catch(
        function onSocketError(error) {
            Sentry.captureException(error);
            log.error(`Error in port router: ${error.message}`);
        },
    );
}

export function onUdpMessage({
    incomingSocket,
    message,
    remoteInfo,
    log = getServerLogger("gateway"),
}: {
    incomingSocket: UdpSocket;
    message: Buffer<ArrayBufferLike>;
    remoteInfo: RemoteInfo;
    log?: ServerLogger;
}) {
    if (!ALLOWED_IPS.includes(remoteInfo.address)) {
        return;
    }

    log.debug("New UDP Message", {
        namespace: "onUdpMessage",
        message: message.toString("hex"),
        remoteInfo: JSON.stringify(remoteInfo),
    });
    // Get the local port and remote address
    const { address: remoteAddress, port: remotePort } = remoteInfo;
    const { port: localPort } = incomingSocket.address();

    // If the local port or remote address is undefined, throw an error
    if (localPort === undefined || remoteAddress === undefined) {
        log.error("localPort or remoteAddress is undefined. Closing socket.");
        incomingSocket.close();
        return;
    }

    incomingSocket.send(
        Buffer.from([0x02, 0x07, 0x00, 0x04]),
        remotePort,
        remoteAddress,
    );
    return;
}
