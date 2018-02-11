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

function MsgPack(packet) {
  if (!(this instanceof MsgPack)) {
    return MsgPack(packet);
  }

  this.sourcePacket = packet;
  this.SetOpCode(packet.readInt16BE());
  this.SetMsgLen(packet.readInt16BE(2));
}

MsgPack.prototype.GetOpCode = function GetOpCode() {
  return this.opCode;
};

MsgPack.prototype.SetOpCode = function SetOpCode(opCode) {
  this.opCode = opCode;
};

MsgPack.prototype.GetMsgLen = function GetMsgLen() {
  return this.msgLen;
};

MsgPack.prototype.SetMsgLen = function SetMsgLen(msgLen) {
  this.msgLen = msgLen;
};

module.exports = MsgPack;
