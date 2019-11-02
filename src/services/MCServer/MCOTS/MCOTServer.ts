// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { ConnectionObj } from "../ConnectionObj";
import { GenericReplyMsg } from "../GenericReplyMsg";
import { LobbyMsg } from "./LobbyMsg";
import { LoginMsg } from "./LoginMsg";
import { MessageNode } from "./MessageNode";
import { Logger } from "../../shared/loggerManager";

export class MCOTServer {
  public logger = new Logger().getLogger("MCOTSServer");
  /**
   * Return the string representation of the numeric opcode
   * @param {int} msgID
   */
  public _MSG_STRING(msgID: number) {
    switch (msgID) {
      case 105:
        return "MC_LOGIN";
      case 106:
        return "MC_LOGOUT";
      case 109:
        return "MC_SET_OPTIONS";
      case 141:
        return "MC_STOCK_CAR_INFO";
      case 213:
        return "MC_LOGIN_COMPLETE";
      case 266:
        return "MC_UPDATE_PLAYER_PHYSICAL";
      case 324:
        return "MC_GET_LOBBIES";
      case 325:
        return "MC_LOBBIES";
      case 438:
        return "MC_CLIENT_CONNECT_MSG";
      case 440:
        return "MC_TRACKING_MSG";

      default:
        return "Unknown";
    }
  }

  public async _login(con: ConnectionObj, node: MessageNode) {
    /**
     * Let's turn it into a LoginMsg
     */
    const loginMsg = new LoginMsg(node.data);

    // Update the appId
    loginMsg.appId = con.appId;

    loginMsg.dumpPacket();

    // Create new response packet
    const pReply = new GenericReplyMsg();
    pReply.msgNo = 213;
    pReply.msgReply = 105;
    pReply.appId = con.appId;
    const rPacket = new MessageNode("Sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { con, nodes: [rPacket] };
  }

  public async _getLobbies(con: ConnectionObj, node: MessageNode) {
    this.logger.info(`In _getLobbies...`);
    const lobbiesListMsg = node;

    // Update the appId
    lobbiesListMsg.appId = con.appId;

    // Dump the packet
    this.logger.info("Dumping request...");
    lobbiesListMsg.dumpPacket();

    // Create new response packet
    const lobbyMsg = new LobbyMsg();

    const pReply = new GenericReplyMsg();
    pReply.msgNo = 325;
    pReply.msgReply = 324;
    const rPacket = new MessageNode("Sent");
    rPacket.flags = 9;

    rPacket.deserialize(node.serialize());

    // Set the data of the GenericReplyMsg to the LobbyMsg
    pReply.setData(lobbyMsg.serialize());
    rPacket.updateBuffer(lobbyMsg.serialize());

    // Set the AppId
    rPacket.appId = con.appId;

    // Dump the packet
    lobbyMsg.dumpPacket();
    rPacket.dumpPacket();

    return { con, nodes: [rPacket] };
  }

  public async _logout(con: ConnectionObj, node: MessageNode) {
    const logoutMsg = node;

    logoutMsg.data = node.serialize();

    // Update the appId
    logoutMsg.appId = con.appId;

    // Create new response packet
    const pReply = new GenericReplyMsg();
    pReply.msgNo = 101;
    pReply.msgReply = 106;
    const rPacket = new MessageNode("Sent");

    // rPacket.dumpPacket();

    return { con, nodes: [] };
  }

  public async _setOptions(con: ConnectionObj, node: MessageNode) {
    const setOptionsMsg = node;

    setOptionsMsg.data = node.serialize();

    // Update the appId
    setOptionsMsg.appId = con.appId;

    // Create new response packet
    const pReply = new GenericReplyMsg();
    pReply.msgNo = 101;
    pReply.msgReply = 109;
    const rPacket = new MessageNode("Sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { con, nodes: [rPacket] };
  }

  public async _trackingMessage(con: ConnectionObj, node: MessageNode) {
    const trackingMsg = node;

    trackingMsg.data = node.serialize();

    // Update the appId
    trackingMsg.appId = con.appId;

    // Create new response packet
    const pReply = new GenericReplyMsg();
    pReply.msgNo = 101;
    pReply.msgReply = 440;
    const rPacket = new MessageNode("Sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { con, nodes: [rPacket] };
  }

  public async _updatePlayerPhysical(con: ConnectionObj, node: MessageNode) {
    const updatePlayerPhysicalMsg = node;

    updatePlayerPhysicalMsg.data = node.serialize();

    // Update the appId
    updatePlayerPhysicalMsg.appId = con.appId;

    // Create new response packet
    const pReply = new GenericReplyMsg();
    pReply.msgNo = 101;
    pReply.msgReply = 266;
    const rPacket = new MessageNode("Sent");

    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    rPacket.dumpPacket();

    return { con, nodes: [rPacket] };
  }
}
