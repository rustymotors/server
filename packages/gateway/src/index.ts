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

import { Socket as TcpSocket } from 'node:net';
import { createSocket, RemoteInfo, Socket, Socket as UdpSocket } from 'node:dgram';
import { randomUUID } from 'node:crypto';
import { tagSocket } from './socketUtility.js';
import { getPortRouter } from './portRouters.js';
import * as Sentry from '@sentry/node';
import {
    addSocketPair,
    getServerLogger,
    MessageQueue,
    messageQueueItem,
    ServerLogger,
    TaggedTcpSocket,
} from 'rusty-motors-shared';
import { processSocketData } from './npsPortRouter.js';
import { Roarr as log } from 'roarr';

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
    log = getServerLogger('onSocketConnection'),
}: {
    incomingSocket: TcpSocket;
    log?: ServerLogger;
}) {
    // Get the local port and remote address
    const { localPort, remoteAddress } = incomingSocket;

    // If the local port or remote address is undefined, throw an error
    if (localPort === undefined || remoteAddress === undefined) {
        log.error('localPort or remoteAddress is undefined. Closing socket.');
        if (!incomingSocket.destroyed) {
            incomingSocket.destroy();
        }
        return;
    }

    if (!['73.148.184.53'].includes(remoteAddress)) {
        return;
    }

    let id = `${randomUUID()}`;
    id = id.substring(0, id.indexOf('-'));
    id = `${id}:${localPort}`;

    const socketWithId = tagSocket(
        incomingSocket,
        Date.now(),
        id,
        localPort,
    ) as TaggedTcpSocket;

    /*
     * At this point, we have a tagged socket with an ID.
     */

    const portRouter = getPortRouter(localPort);

    // Hand the socket to the port router
    portRouter({ taggedSocket: socketWithId }).catch(
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
    logger = getServerLogger('onUdpMessage'),
}: {
    incomingSocket: UdpSocket;
    message: Buffer<ArrayBufferLike>;
    remoteInfo: RemoteInfo;
    logger?: ServerLogger;
}) {
    if (!['73.148.184.53'].includes(remoteInfo.address)) {
        return;
    }

    log.debug(
        {
            namespace: 'onUdpMessage',
            message: message.toString('hex'),
            remoteInfo: JSON.stringify(remoteInfo),
        },
        'New UDP Message',
    );
    // Get the local port and remote address
    const { address: remoteAddress, port: remotePort } = remoteInfo;
    const { port: localPort } = incomingSocket.address();

    // If the local port or remote address is undefined, throw an error
    if (localPort === undefined || remoteAddress === undefined) {
        log.error('localPort or remoteAddress is undefined. Closing socket.');
        incomingSocket.close();
        return;
    }

    incomingSocket.send(Buffer.from([0x02, 0x07, 0x00, 0x04]), remotePort, remoteAddress)
    return

    // Creating connected socket
    // const connectedSocket = createSocket("udp4")
    // connectedSocket.bind({
    //     address: incomingSocket.address().address,
    // });
    // connectedSocket.on("message", (msg, rinfo) => {
    //     log.warn({
    //         msg: msg.toString("hex"),
    //         remoteAddress: rinfo.address,
    //         localPort
    //     },
    // "Received UDP Message on Connected Socket")
    // })
    // connectedSocket.on("connect", () => {
    //     log.warn('Connected to client using UDP!');
    // })
    // connectedSocket.on("error", (err) => {
    //     log.fatal({
    //         error: JSON.stringify(err)
    //     },
    // "Error connecting UDP outbound!")
    // })
    // connectedSocket.connect(remotePort, remoteAddress)

    let id = `${randomUUID()}`;
    id = id.substring(0, id.indexOf('-'));
    id = `${remoteAddress}:${remotePort}`;

    const socketWithId = tagSocket(incomingSocket, Date.now(), id, localPort);

    const udpReceiveQueue = new MessageQueue(
        `${id}_in`,
        10,
        async (item: messageQueueItem) => {},
    );
    const udpSendQueue = new MessageQueue(
        `${id}_out`,
        10,
        async (item: messageQueueItem) => {
            log.debug({
                data: item.data.toString("hex")
            }, "Sending  UDP message")
            incomingSocket.send(item.data, remotePort, remoteAddress, (err) => {
                if (err) {
                    log.fatal({error: JSON.stringify(err)}, "Error sending UDP message!")
                }
            });
        },
    );

    addSocketPair(id, {
        receive: udpReceiveQueue,
        send: udpSendQueue,
    });

    /*
     * At this point, we have a tagged socket with an ID.
     */
    processSocketData(message, log, id, localPort, socketWithId);
}
