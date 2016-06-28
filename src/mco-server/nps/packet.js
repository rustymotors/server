function buildPacket (len, header, content) {
  var packet = Buffer.alloc(len)

  // Add the response code
  packet.writeUInt16BE(header, 0)

  // Write the content
  content.copy(packet, 2)

  return packet
}

module.exports = {
  buildPacket: buildPacket
}
