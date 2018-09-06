// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as net from "net";
import { Connection } from "./Connection";
import ConnectionMgr from "./connectionMgr";
import { IRawPacket } from "./IRawPacket";
import { IServerConfiguration } from "./IServerConfiguration";
import { Logger } from "./logger";
import { sendPacketOkLogin } from "./TCPManager";

const logger = new Logger().getLogger();

async function onData(
  data: Buffer,
  connection: Connection,
  config: IServerConfiguration
) {
  try {
    const { localPort, remoteAddress } = connection.sock;
    const rawPacket: IRawPacket = {
      connection,
      data,
      localPort,
      remoteAddress,
      timestamp: Date.now(),
    };
    // Dump the raw packet
    logger.debug(
      `rawPacket's data prior to proccessing: ${rawPacket.data.toString("hex")}`
    );

    const newConnection = await connection.mgr.processData(rawPacket, config);
    if (!connection.remoteAddress) {
      throw new Error("Remote address is empty");
    }
    connection.mgr._updateConnectionByAddressAndPort(
      connection.remoteAddress,
      connection.localPort,
      newConnection
    );
  } catch (error) {
    logger.error(error);
    logger.error(error.stack);
    process.exit();
  }
}
function listener(
  socket: net.Socket,
  connectionMgr: ConnectionMgr,
  config: IServerConfiguration
) {
  // Received a new connection
  // Turn it into a connection object
  const connection = connectionMgr.findOrNewConnection(socket);

  const { localPort, remoteAddress } = socket;
  logger.info(
    `[listenerThread] Client ${remoteAddress} connected to port ${localPort}`
  );
  if (socket.localPort === 7003 && connection.inQueue) {
    sendPacketOkLogin(socket);
    connection.inQueue = false;
  }
  socket.on("end", () => {
    // connectionMgr.deleteConnection(connection);
    logger.info(
      `[listenerThread] Client ${remoteAddress} disconnected from port ${localPort}`
    );
  });
  socket.on("data", data => {
    onData(data, connection, config);
  });
  socket.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code !== "ECONNRESET") {
      logger.error(err.message);
      process.exit(1);
    }
  });
}

/**
 * Given a port and a connection manager object, create a new TCP socket listener for that port
 * @param {Int} localPort
 * @param {connectionMgr} connectionMgr
 */
export async function startTCPListener(
  localPort: number,
  connectionMgr: ConnectionMgr,
  config: IServerConfiguration
) {
  net
    .createServer(socket => {
      listener(socket, connectionMgr, config);
    })
    .listen({ port: localPort, host: "0.0.0.0" }, () => {
      logger.info(`[listenerThread] Listener started on port ${localPort}`);
    });
}
