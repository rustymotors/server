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

    this.setBuffer(packet);
    this.setMsgHeader(packet);

    this.rawBuffer = packet;

    this.personaId = packet.readInt32LE(6);

    if (packet.length <= 6) {
      throw new Error(`Packet too short!: ${packet.toString()}`);
    }

    try {
      this.msgNo = this.buffer.readInt16LE(0);
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        logger.error(packet.toString('hex'));
        throw error;
      }
    }

    // Set the appId to the Persona Id
    this.appId = this.personaId;

    // DWORD seq; sequenceNo
    this.seq = packet.readInt32LE(6);

    this.flags = packet.readInt8(10);
  }

  setMsgNo(newMsgNo) {
    this.msgNo = newMsgNo;
    this.buffer.writeInt16LE(this.msgNo, 0);
  }

  setSeq(newSeq) {
    this.seq = newSeq;
    this.rawBuffer.writeInt32LE(this.seq, 6);
  }

  setMsgHeader(packet) {
    const header = Buffer.alloc(6);
    packet.copy(header, 0, 0, 6);
    this.header = new MsgHead(header);
  }

  setBuffer(packet) {
    this.buffer = packet.slice(11);
  }

  updateBuffer(buffer) {
    this.buffer = buffer;
    this.msgNo = this.buffer.readInt16LE(0);
  }

  BaseMsgHeader(packet) {
    // WORD msgNo;
    this.msgNo = packet.readInt16LE(0);
  }

  getBaseMsgHeader(packet) {
    return this.BaseMsgHeader(packet);
  }

  isMCOTS() {
    return this.header.mcosig === 'TOMC';
  }

  dumpPacket() {
    logger.info('=============================================');
    logger.debug('Packet has a valid MCOTS header signature');
    logger.info('=============================================');
    logger.debug(`Header Length: ${this.header.length}`);
    logger.debug(`Header MCOSIG: ${this.isMCOTS()}`);
    logger.debug(`MsgNo:    ${this.msgNo}`);
    logger.debug(`Sequence: ${this.seq}`);
    logger.debug(`Flags: ${this.flags}`);
    logger.debug(`Buffer: ${this.buffer}`);
    logger.info('------------------------------------------------');
    logger.debug(`Buffer as text: ${this.buffer.toString('utf8')}`);
    logger.info('------------------------------------------------');
    logger.debug(`Buffer as string: ${this.buffer.toString('hex')}`);
    logger.debug(`Raw Buffer as string: ${this.rawBuffer.toString('hex')}`);
    logger.info('=============================================');
  }
}
module.exports = { MessageNode };
