var nps = require('../nps/nps.js')

function npsResponse_GetPersonaMaps () {
  var responseBuffer = new Buffer(516)
  var responseCodeBuffer = new Buffer(2)
  responseBuffer.fill(0)

  responseBuffer[2] = 0x01
  responseBuffer[3] = 0x00

  for (var i = 4; i < 517; i++) {
    responseBuffer[i] = nps.toHex((Math.random() * 90 | 65) + 1)
  }

  // This is the persona count
  responseBuffer[12] = 0x00
  responseBuffer[13] = 0x01

  // PersonaId
  responseBuffer[20] = 0x00
  responseBuffer[21] = 0x00
  responseBuffer[22] = 0x00
  responseBuffer[23] = 0x01

  // Shard ID
  responseBuffer[24] = 0x00
  responseBuffer[25] = 0x00
  responseBuffer[26] = 0x00
  responseBuffer[27] = 0x2C

  // Persona Name = 30-bit null terminated string
  responseBuffer[34] = 0x43
  responseBuffer[35] = 0x44
  responseBuffer[36] = 0x45
  responseBuffer[37] = 0x46

  responseBuffer[38] = 0x47
  responseBuffer[39] = 0x48
  responseBuffer[40] = 0x49
  responseBuffer[41] = 0x4A

  responseBuffer[42] = 0x4B
  responseBuffer[43] = 0x4C
  responseBuffer[44] = 0x4E
  responseBuffer[45] = 0x4F

  responseBuffer[46] = 0x50
  responseBuffer[47] = 0x51
  responseBuffer[48] = 0x52
  responseBuffer[49] = 0x53

  responseBuffer[50] = 0x54
  responseBuffer[51] = 0x55
  responseBuffer[52] = 0x56
  responseBuffer[53] = 0x57

  responseBuffer[54] = 0x58
  responseBuffer[55] = 0x59
  responseBuffer[56] = 0x5A
  responseBuffer[57] = 0x41

  responseBuffer[58] = 0x42
  responseBuffer[59] = 0x43
  responseBuffer[60] = 0x44
  responseBuffer[61] = 0x45

  responseBuffer[62] = 0x46
  responseBuffer[63] = 0x47
  responseBuffer[64] = 0x00

  // Response Code
  responseCodeBuffer.fill(0)
  responseCodeBuffer[0] = 0x06
  responseCodeBuffer[1] = 0x07
  responseCodeBuffer.copy(responseBuffer)

  return responseBuffer
}

module.exports = {
  npsResponse_GetPersonaMaps
}
