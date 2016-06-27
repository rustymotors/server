var crypto = require('crypto')

function buildPacket (len, header, content) {
  var packet = new Buffer(len)

  // Fill packet with random bytes
  packet = crypto.randomBytes(packet.length)

  // Add the response code
  packet.writeUInt16BE(header, 0)

  // Write the content
  content.copy(packet, 2)

  return packet
}

module.exports = {
  buildPacket: buildPacket
}
