// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { IRawPacket } from "../IRawPacket";

import { NPSUserStatus } from "../../shared/messageTypes/npsUserStatus";

import { ConnectionObj } from "../ConnectionObj";
import { premadeLogin } from "./packet";
import { DatabaseManager } from "../../shared/databaseManager";
import { Logger } from "../../shared/loggerManager";
import { IServerConfiguration } from "../../shared/configManager";

export class LoginServer {
  public logger = new Logger().getLogger("LoginServer");
  public databaseManager = new DatabaseManager();

  public async dataHandler(
    rawPacket: IRawPacket,
    config: IServerConfiguration
  ) {
    const { connection, data } = rawPacket;
    const { localPort, remoteAddress } = rawPacket;
    this.logger.info({ localPort, remoteAddress }, "Received packet");
    // TODO: Check if this can be handled by a MessageNode object
    const { sock } = connection;
    const requestCode = data.readUInt16BE(0).toString(16);

    let responsePacket;

    switch (requestCode) {
      // npsUserLogin
      case "501": {
        responsePacket = await this._userLogin(connection, data, config);
        break;
      }
      default:
        this.logger.info(
          {
            requestCode,
            localPort,
            data: rawPacket.data.toString("hex"),
          },
          "Unknown nps code recieved"
        );
        return connection;
    }
    this.logger.info(
      {
        userStatus: responsePacket.toString("hex"),
      },
      "responsePacket object from dataHandler"
    );
    this.logger.info(
      `responsePacket's data prior to sending: ${responsePacket.toString(
        "hex"
      )}`
    );
    sock.write(responsePacket);
    return connection;
  }

  public _npsGetCustomerIdByContextId(contextId: string) {
    this.logger.info(`Entering _npsGetCustomerIdByContextId...`);
    const users = [
      {
        contextId: "5213dee3a6bcdb133373b2d4f3b9962758",
        customerId: Buffer.from([0xac, 0x01, 0x00, 0x00]),
        userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
      },
      {
        contextId: "d316cd2dd6bf870893dfbaaf17f965884e",
        customerId: Buffer.from([0x00, 0x54, 0xb4, 0x6c]),
        userId: Buffer.from([0x00, 0x00, 0x00, 0x01]),
      },
    ];
    if (contextId.toString() === "") {
      throw new Error(`Unknown contextId: ${contextId.toString()}`);
    }
    const userRecord = users.filter(user => {
      return user.contextId === contextId;
    });
    if (userRecord.length != 1) {
      this.logger.warn(
        {
          contextId,
        },
        "preparing to leave _npsGetCustomerIdByContextId after not finding record"
      );
      throw new Error(
        `Unable to locate user record matching contextId ${contextId}`
      );
    }
    this.logger.info(
      {
        contextId,
        userRecord,
      },
      "preparing to leave _npsGetCustomerIdByContextId after finding record"
    );
    return userRecord[0];
  }

  /**
   * Process a UserLogin packet
   * Return a NPS_Serialize
   * @param {ConnectionObj} connection
   * @param {Buffer} data
   */
  public async _userLogin(
    connection: ConnectionObj,
    data: Buffer,
    config: IServerConfiguration
  ) {
    const { sock } = connection;
    const { localPort } = sock;
    const userStatus = new NPSUserStatus(data);
    this.logger.info(
      {
        localPort,
        remoteAddress: connection.remoteAddress,
      },
      "Received login packet"
    );

    userStatus.extractSessionKeyFromPacket(config.serverConfig, data);

    this.logger.info(
      {
        userStatus: userStatus.toJSON(),
      },
      "UserStatus object from _userLogin"
    );
    userStatus.dumpPacket();

    // Load the customer record by contextId
    // TODO: This needs to be from a database, right now is it static
    const customer = this._npsGetCustomerIdByContextId(userStatus.contextId);

    // Save sessionKey in database under customerId
    this.logger.info(`Preparing to update session key in db`);
    await this.databaseManager._updateSessionKey(
      customer.customerId.readInt32BE(0),
      userStatus.sessionKey,
      userStatus.contextId,
      connection.id
    );
    this.logger.info(`Session key updated`);

    // Create the packet content
    // TODO: This needs to be dynamically generated, right now we are using a
    // a static packet that works _most_ of the time
    const packetContent = premadeLogin();
    this.logger.warn(`Using Premade Login: ${packetContent.toString("hex")}`);

    // MsgId: 0x601
    Buffer.from([0x06, 0x01]).copy(packetContent);

    // Packet length: 0x0100 = 256
    Buffer.from([0x01, 0x00]).copy(packetContent, 2);

    // load the customer id
    customer.customerId.copy(packetContent, 12);

    // Don't use queue (+208, but I'm not sure if this includes the header or not)
    Buffer.from([0x00]).copy(packetContent, 208);

    /**
     * Return the packet twice for debug
     * Debug sends the login request twice, so we need to reply twice
     * Then send ok to login packet
     */
    const fullPacket = Buffer.concat([packetContent, packetContent]);
    return fullPacket;
  }
}
