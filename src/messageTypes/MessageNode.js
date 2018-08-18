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

const { logger } = require('../logger');
const { MsgHead } = require('./MsgHead');

class MessageNode {
  constructor(packet) {
    this.toFrom = 0;

    this.appId = 0;

    this.deserialize(packet);
  }

  deserialize(packet) {
    this.dataLength = packet.readInt16LE(0);
    this.mcoSig = packet.slice(2, 6).toString();
    this.seq = packet.readInt16LE(6);
    this.flags = packet.readInt8(10);

    // data starts at offset 11
    this.data = packet.slice(11);

    // set message number
    try {
      this.msgNo = this.data.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        logger.error(packet.toString('hex'));
        throw error;
      }
    }
  }

  serialize() {
    const packet = Buffer.alloc(this.dataLength + 2);
    packet.writeInt16LE(this.dataLength, 0);
    packet.write(this.mcoSig, 2);
    packet.writeInt16LE(this.seq, 6);
    packet.writeInt8(this.flags, 10);
    this.data.copy(packet, 11);
    return packet;
  }

  setAppId(appId) {
    this.appId = appId;
  }

  setMsgNo(newMsgNo) {
    this.msgNo = newMsgNo;
    this.data.writeInt16LE(this.msgNo);
  }

  setSeq(newSeq) {
    this.seq = newSeq;
  }

  setMsgHeader(packet) {
    const header = Buffer.alloc(6);
    packet.copy(header, 0, 0, 6);
    this.header = new MsgHead(header);
  }

  updateBuffer(buffer) {
    this.data = buffer;
    this.dataLength = this.data.length;
    this.msgNo = this.data.readInt16LE(0);
  }

  BaseMsgHeader(packet) {
    // WORD msgNo;
    this.msgNo = packet.readInt16LE(0);
  }

  getBaseMsgHeader(packet) {
    return this.BaseMsgHeader(packet);
  }

  isMCOTS() {
    return this.mcoSig === 'TOMC';
  }

  dumpPacket() {
    logger.debug('= MessageNode ===============================');
    logger.debug('Packet has a valid MCOTS header signature');
    logger.debug('=============================================');
    logger.debug(`Header Length: ${this.dataLength}`);
    logger.debug(`Header MCOSIG: ${this.isMCOTS()}`);
    logger.debug(`MsgNo:    ${this.msgNo}`);
    logger.debug(`Sequence: ${this.seq}`);
    logger.debug(`Flags: ${this.flags}`);
    logger.debug('------------------------------------------------');
    logger.debug(`data as string: ${this.data.toString('hex')}`);
    logger.debug('------------------------------------------------');
    logger.debug(`packet as string: ${this.serialize().toString('hex')}`);
    logger.debug('= MessageNode ==================================');
  }
}
module.exports = { MessageNode };
