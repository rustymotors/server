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

const logger = require("./logger.js");

// struct msgHead
function msgHead(header) {
  if (!(this instanceof msgHead)) {
    return new msgHead(header);
  }

  this.length = header.readInt16LE();
  this.mcosig = header.toString("ascii", 2);
}

// struct BaseMsgHeader
function BaseMsgHeader(msg) {
  if (!(this instanceof BaseMsgHeader)) {
    return new BaseMsgHeader(msg);
  }

  // WORD	msgNo;
  this.msgNo = msg.readInt16LE();
}

// struct MessageNode
function MessageNode(packet) {
  if (!(this instanceof MessageNode)) {
    return new MessageNode(packet);
  }

  this.toFrom = Buffer.from([0x00, 0x00]);

  this.appId = Buffer.from([0x00, 0x00]);

  this.setMsgHeader(packet);
  this.setBuffer(packet);

  this.rawBuffer = packet;

  if (packet.length <= 6) {
    logger.error("Packet too short!: ", packet);
    return;
  }

  //DWORD	seq;	// sequenceNo
  this.seq = packet.readInt32LE(6);

  this.flags = packet[10];
}

MessageNode.prototype.setMsgHeader = function setMsgHeader(packet) {
  const header = Buffer.alloc(6);
  packet.copy(header, 0, 0, 6);
  this.header = msgHead(header);
};

MessageNode.prototype.getBaseMsgHeader = function getBaseMsgHeader(packet) {
  return BaseMsgHeader(packet);
};

MessageNode.prototype.setBuffer = function setSetBuffer(packet) {
  this.buffer = packet.slice(11);
};

MessageNode.prototype.isMCOTS = function isMCOTS() {
  return this.header.mcosig == "TOMC";
};

module.exports = { MessageNode, BaseMsgHeader };
