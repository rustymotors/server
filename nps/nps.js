function npsSetResponseCodeToBuffer (buff, responseCode) {
  switch (responseCode) {
    // hex 601 = ok
    case 'NPS_AUTH_OK':
      buff[0] = 0x06
      buff[1] = 0x01
      return buff
    // hex 601 = persona ok
    case 'NPS_PERSONA_CREATE_OK':
      buff[0] = 0x06
      buff[1] = 0x01
      return buff
    // hex 607 = persona get ok
    case 'NPS_PERSONA_GET_OK':
      buff[0] = 0x06
      buff[1] = 0x07

      // Set number of personas
      // buff[41] = 0x01
      return buff
    // hex 611 = persona
    case 'NPS_PERSONA_GET_UNKNOWN':
      buff[0] = 0x06
      buff[1] = 0x11
      return buff
    // hex 623 = problem with account
    case 'NPS_AUTH_DENIED':
      buff[0] = 0x06
      buff[1] = 0x23
      return buff
    default:
      return buff
  }
}

function npsGetRequestCodeToBuffer (buff) {
  var tmp = buff[0].toString(16) + buff[1].toString(16)
  switch (tmp) {
    // hex 519 = NPSGetPersonaInfoByNames()
    case '519':
      return 'NPSGetPersonaInfoByName()'
    // hex 519 = NPSGetPersonaMaps()
    case '532':
      return 'NPSGetPersonaMaps()'
    default:
      return tmp.toString('hex')
  }
}

function npsRequestResponse (buff, requestCode) {
  switch (requestCode) {
    // hex 601 = ok
    case 'NPSGetPersonaInfoByName()':
      return npsSetResponseCodeToBuffer(buff, 'NPS_PERSONA_GET_OK')
      // hex 601 = ok
    case 'NPSGetPersonaMaps()':
      return npsSetResponseCodeToBuffer(buff, 'NPS_PERSONA_GET_OK')
    default:
      return buff
  }
}

// NPSGetPersonaInfoByName()
// 602 = 1538 = ??
// 607 = 1553 = Name in Use
// 611 = 1553 = ??

module.exports = {
  npsRequestResponse: npsRequestResponse,
  npsGetRequestCodeToBuffer: npsGetRequestCodeToBuffer,
  npsSetResponseCodeToBuffer: npsSetResponseCodeToBuffer
}
