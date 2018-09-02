// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Connection } from "./Connection";
import { LobbyServer } from "./LobbyServer/LobbyServer";
import { logger } from "./logger";
import { GenericReplyMsg } from "./messageTypes/GenericReplyMsg";
import { MessageNode } from "./messageTypes/MessageNode";

export class MCOTServer {
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

      default:
        return "Unknown";
    }
  }

  public async _logout(con: Connection, node: MessageNode) {
    const logoutMsg = node;

    logoutMsg.data = node.serialize();

    // Update the appId
    logoutMsg.appId = con.appId;

    // Create new response packet
    // TODO: Do this cleaner
    const pReply = new GenericReplyMsg();
    pReply.msgNo = 101;
    pReply.msgReply = 106;
    const rPacket = new MessageNode();

    // lobbyMsg.dumpPacket();

    // const rPacket = new MessageNode();
    // rPacket.deserialize(node.serialize());
    // rPacket.updateBuffer(pReply.serialize());
    // logger.debug("Dumping response...");
    // rPacket.dumpPacket();

    return { con, nodes: [] };
  }

  public async _setOptions(con: Connection, node: MessageNode) {
    const setOptionsMsg = node;

    setOptionsMsg.data = node.serialize();

    // Update the appId
    setOptionsMsg.appId = con.appId;

    // Create new response packet
    // TODO: Do this cleaner
    const pReply = new GenericReplyMsg();
    pReply.msgNo = 101;
    pReply.msgReply = 109;
    const rPacket = new MessageNode();

    // lobbyMsg.dumpPacket();

    // const rPacket = new MessageNode();
    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    logger.debug("Dumping response...");
    rPacket.dumpPacket();

    return { con, nodes: [rPacket] };
  }

  public async _updatePlayerPhysical(con: Connection, node: MessageNode) {
    const updatePlayerPhysicalMsg = node;

    updatePlayerPhysicalMsg.data = node.serialize();

    // Update the appId
    updatePlayerPhysicalMsg.appId = con.appId;

    // Create new response packet
    // TODO: Do this cleaner
    const pReply = new GenericReplyMsg();
    pReply.msgNo = 101;
    pReply.msgReply = 266;
    const rPacket = new MessageNode();

    // lobbyMsg.dumpPacket();

    // const rPacket = new MessageNode();
    rPacket.deserialize(node.serialize());
    rPacket.updateBuffer(pReply.serialize());
    logger.debug("Dumping response...");
    rPacket.dumpPacket();

    return { con, nodes: [rPacket] };
  }
}
