// MsgPack.js
function MsgPack(packet) {
  if (!(this instanceof MsgPack)) {
    return new MsgPack(packet);
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
