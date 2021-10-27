// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "@drazisil/mco-logger";
import {
  AppConfiguration,
  IConnectionManager,
  IMCServer,
  ITCPConnection,
} from "@mco-server/types";
import { ConnectionManager } from "./connection-mgr";
import { ConfigurationManager } from "@mco-server/config";
import { ListenerThread } from "./listener-thread";

const { log } = Logger.getInstance();

/**
 * This class starts all the servers
 * @module MCServer
 */

export class MCServer implements IMCServer {
  static _instance: IMCServer;
  config: AppConfiguration;
  private mgr?: IConnectionManager;
  serviceName: string;

  static getInstance(): IMCServer {
    if (!MCServer._instance) {
      MCServer._instance = new MCServer();
    }
    return MCServer._instance;
  }

  private constructor() {
    this.config = ConfigurationManager.getInstance().getConfig();
    this.mgr = ConnectionManager.getInstance();
    this.serviceName = "mcoserver:MCServer";
  }
  clearConnectionQueue(): void {
    if (this.mgr === undefined) {
      throw new Error("Connection manager not set");
    }
    this.mgr.resetAllQueueState();
  }
  getConnections(): ITCPConnection[] {
    if (this.mgr === undefined) {
      throw new Error("Connection manager is not set");
    }
    return this.mgr.dumpConnections();
  }

  /**
   * Start the HTTP, HTTPS and TCP connection listeners
   * @returns {Promise<void>}
   */

  async startServers(): Promise<void> {
    const listenerThread = ListenerThread.getInstance();
    log("info", "Starting the listening sockets...", {
      service: this.serviceName,
    });
    // TODO: Seperate the PersonaServer ports of 8226 and 8228
    const tcpPortList = [
      6660, 8228, 8226, 7003, 8227, 43_200, 43_300, 43_400, 53_303, 9000, 9001,
      9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013,
      9014,
    ];

    if (this.mgr === undefined) {
      throw new Error("Connection manager is not set");
    }

    for (const port of tcpPortList) {
      listenerThread.startTCPListener(port, this.mgr);
      log("debug", `port ${port} listening`, { service: this.serviceName });
    }

    log("info", "Listening sockets create successfully.", {
      service: this.serviceName,
    });
  }
}
