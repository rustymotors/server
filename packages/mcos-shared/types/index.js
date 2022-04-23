import { privateDecrypt } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { APP_CONFIG } from '../config/index.js'

/**
 * @export
 * @typedef LobbyCiphers
 * @property {import('node:crypto').Cipher} [cipher]
 * @property {import('node:crypto').Decipher} [decipher]
 */

/**
 * @export
 * @typedef UnprocessedPacket
 * @property {string} connectionId
 * @property {import('mcos-core').TCPConnection} connection
 * @property {Buffer} data
 * @property {number} timestamp
 */

/**
 * @export
 * @typedef SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */

/**
 * @export
 * @typedef PersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */

/**
 * @export
 * @typedef UserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */

/**
 * @export
 * @typedef NpsCommandMap
 * @property {string} name
 * @property {number} value
 * @property {'Lobby' | 'Login'} module
 */

/**
 * Commands from the game server to the game client
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOBBYSERVER_COMMANDS = [
  { name: 'NPS_FORCE_LOGOFF', value: 513, module: 'Lobby' },
  { name: 'NPS_USER_LEFT', value: 514, module: 'Lobby' },
  { name: 'NPS_USER_JOINED', value: 515, module: 'Lobby' },
  { name: 'NPS_USER_INFO', value: 516, module: 'Lobby' },
  { name: 'NPS_SYSTEM_ALERT', value: 517, module: 'Lobby' },
  { name: 'NPS_CLIENT_COUNT', value: 518, module: 'Lobby' },
  { name: 'NPS_ACK', value: 519, module: 'Lobby' },
  { name: 'NPS_USER_LEFT_CHANNEL', value: 520, module: 'Lobby' },
  { name: 'NPS_CHANNEL_CLOSED', value: 521, module: 'Lobby' },
  { name: 'NPS_DUP_USER', value: 522, module: 'Lobby' },
  { name: 'NPS_SERVER_FULL', value: 523, module: 'Lobby' },
  { name: 'NPS_USER_JOINED_CHANNEL', value: 524, module: 'Lobby' },
  { name: 'NPS_SERVER_INFO', value: 525, module: 'Lobby' },
  { name: 'NPS_CHANNEL_CREATED', value: 526, module: 'Lobby' },
  { name: 'NPS_CHANNEL_DELETED', value: 527, module: 'Lobby' },
  { name: 'NPS_READY_LIST', value: 528, module: 'Lobby' },
  { name: 'NPS_USER_LIST', value: 529, module: 'Lobby' },
  { name: 'NPS_SERVER_LIST', value: 530, module: 'Lobby' },
  { name: 'NPS_CHANNEL_DENIED', value: 531, module: 'Lobby' },
  { name: 'NPS_CHANNEL_GRANTED', value: 532, module: 'Lobby' },
  { name: 'NPS_CHANNEL_CONDITIONAL', value: 533, module: 'Lobby' },
  { name: 'NPS_SERVER_REDIRECT', value: 534, module: 'Lobby' },
  { name: 'NPS_HEARTBEAT', value: 535, module: 'Lobby' },
  { name: 'NPS_HEARTBEAT_TIMEOUT', value: 536, module: 'Lobby' },
  { name: 'NPS_CHANNEL_UPDATE', value: 537, module: 'Lobby' },
  { name: 'NPS_FORCE_LEAVE_CHANNEL', value: 538, module: 'Lobby' },
  { name: 'NPS_USER_LOCATION', value: 539, module: 'Lobby' },
  { name: 'NPS_GAME_SERVER_STARTED', value: 540, module: 'Lobby' },
  { name: 'NPS_GAME_SERVER_TERMINATED', value: 541, module: 'Lobby' },
  { name: 'NPS_VERSIONS_DIFFERENT', value: 542, module: 'Lobby' },
  { name: 'NPS_SEND_VERSION_STRING', value: 543, module: 'Lobby' },
  { name: 'NPS_GAME_SKU_REGISTRY_KEY', value: 544, module: 'Lobby' },
  { name: 'NPS_PLUGIN_ACK', value: 545, module: 'Lobby' },
  { name: 'NPS_SERVER_CRASHED', value: 546, module: 'Lobby' },
  { name: 'NPS_OPEN_COMM_CHANNEL_ACK', value: 547, module: 'Lobby' },
  { name: 'NPS_GAME_SERVER_STATE_CHANGE', value: 548, module: 'Lobby' },
  { name: 'NPS_SLOT_UPDATE', value: 549, module: 'Lobby' },
  { name: 'NPS_SLOT_LIST', value: 550, module: 'Lobby' },
  { name: 'NPS_CHANNEL_MASTER', value: 551, module: 'Lobby' },
  { name: 'NPS_CHANNEL_MASTER_LIST', value: 552, module: 'Lobby' },
  { name: 'NPS_MINI_USER_LIST', value: 553, module: 'Lobby' },
  { name: 'NPS_INVALID_KEY', value: 554, module: 'Lobby' },
  { name: 'NPS_NO_VALIDATION_SERVER', value: 555, module: 'Lobby' },
  { name: 'NPS_INC_MINI_USER_LIST', value: 556, module: 'Lobby' },
  { name: 'NPS_DEC_MINI_USER_LIST', value: 557, module: 'Lobby' },
  { name: 'NPS_BUDDY_LIST', value: 558, module: 'Lobby' },
  { name: 'NPS_BUDDYLIST_UPDATE', value: 559, module: 'Lobby' }
]

/**
 * Commands from the game client to the game server
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOBBYCLIENT_COMMANDS = [
  { name: 'NPS_LOGIN', value: 256, module: 'Lobby' },
  { name: 'NPS_GET_USER_LIST', value: 257, module: 'Lobby' },
  { name: 'NPS_GET_MY_USER_DATA', value: 258, module: 'Lobby' },
  { name: 'NPS_SET_MY_USER_DATA', value: 259, module: 'Lobby' },
  { name: 'NPS_LOG_OFF_SERVER', value: 260, module: 'Lobby' },
  { name: 'NPS_CLOSE_COMM_CHANNEL', value: 261, module: 'Lobby' },
  { name: 'NPS_OPEN_COMM_CHANNEL', value: 262, module: 'Lobby' },
  { name: 'NPS_GET_CLIENT_COUNT', value: 263, module: 'Lobby' },
  { name: 'NPS_START_GAME', value: 264, module: 'Lobby' },
  { name: 'NPS_READY_FOR_GAME', value: 265, module: 'Lobby' },
  { name: 'NPS_START_GAME_SERVER', value: 266, module: 'Lobby' },
  { name: 'NPS_SET_SLEEP_STATE', value: 267, module: 'Lobby' },
  { name: 'NPS_GET_SERVER_INFO', value: 268, module: 'Lobby' },
  { name: 'NPS_SET_COMM_FLAGS', value: 269, module: 'Lobby' },
  { name: 'NPS_GET_READY_LIST', value: 270, module: 'Lobby' },
  { name: 'NPS_SEND_SERVER_LIST', value: 271, module: 'Lobby' },
  { name: 'NPS_SET_COMM_CHANNEL_RATE', value: 272, module: 'Lobby' },
  { name: 'NPS_SET_HEARTBEAT_TIMEOUT', value: 273, module: 'Lobby' },
  { name: 'NPS_GET_HEARTBEAT_TIMEOUT', value: 274, module: 'Lobby' },
  { name: 'NPS_SET_CHANNEL_DATA', value: 275, module: 'Lobby' },
  { name: 'NPS_FILE_START', value: 276, module: 'Lobby' },
  { name: 'NPS_FILE_DATA', value: 277, module: 'Lobby' },
  { name: 'NPS_FILE_COMPLETED', value: 278, module: 'Lobby' },
  { name: 'NPS_BOOT_USER_FROM_CHANNEL', value: 279, module: 'Lobby' },
  { name: 'NPS_LOCATE_USER', value: 280, module: 'Lobby' },
  { name: 'NPS_ENABLE_FILTER', value: 281, module: 'Lobby' },
  { name: 'NPS_DISABLE_FILTER', value: 282, module: 'Lobby' },
  { name: 'NPS_SLEEP_SERVER', value: 283, module: 'Lobby' },
  { name: 'NPS_WAKE_SERVER', value: 284, module: 'Lobby' },
  { name: 'NPS_TERMINATE_GAME_SERVER', value: 285, module: 'Lobby' },
  { name: 'NPS_SEND_SKU_REGISTRY', value: 286, module: 'Lobby' },
  { name: 'NPS_SET_READY_FOR_GAME', value: 287, module: 'Lobby' },
  { name: 'NPS_LOGIN_RESP', value: 288, module: 'Lobby' },
  { name: 'NPS_SOCKET_RECONNECT', value: 289, module: 'Lobby' },
  { name: 'NPS_SET_SLOT', value: 290, module: 'Lobby' },
  { name: 'NPS_GET_SLOT_LIST', value: 291, module: 'Lobby' },
  { name: 'NPS_SET_CHANNEL_CLOSED', value: 292, module: 'Lobby' },
  { name: 'NPS_UDP_STATUS', value: 293, module: 'Lobby' },
  { name: 'NPS_GET_USER_INFO', value: 294, module: 'Lobby' },
  { name: 'NPS_GET_MASTER_LIST', value: 295, module: 'Lobby' },
  { name: 'NPS_GET_MINI_USER_LIST', value: 296, module: 'Lobby' },
  { name: 'NPS_UDP_FAILURE', value: 297, module: 'Lobby' },
  { name: 'NPS_BUDDYLIST_REFRESH', value: 298, module: 'Lobby' },
  { name: 'NPS_BUDDYLIST_ADD_USERS', value: 299, module: 'Lobby' },
  { name: 'NPS_BUDDYLIST_REMOVE_USERS', value: 300, module: 'Lobby' }
]

/**
 * Commands from the game client to the login server
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOGINCLIENT_COMMANDS = [
  { name: 'NPS_USER_LOGIN', value: 1281, module: 'Login' },
  { name: 'NPS_GAME_LOGIN', value: 1282, module: 'Login' },
  { name: 'NPS_REGISTER_GAME_LOGIN', value: 1283, module: 'Login' },
  { name: 'NPS_SET_GAME_BLOB', value: 1284, module: 'Login' },
  { name: 'NPS_GET_NEXT_SERVER', value: 1285, module: 'Login' },
  { name: 'NPS_NEW_EA_ACCOUNT', value: 1286, module: 'Login' },
  { name: 'NPS_NEW_GAME_ACCOUNT', value: 1287, module: 'Login' },
  { name: 'NPS_UPDATE_EA_ACCOUNT', value: 1288, module: 'Login' },
  { name: 'NPS_UPDATE_GAME_ACCOUNT', value: 1289, module: 'Login' },
  { name: 'NPS_LOCATE_PLAYER', value: 1290, module: 'Login' },
  { name: 'NPS_GET_BUDDY_LIST', value: 1291, module: 'Login' },
  { name: 'NPS_ADD_BUDDY_LIST', value: 1292, module: 'Login' },
  { name: 'NPS_DELETE_BUDDY_LIST', value: 1293, module: 'Login' },
  { name: 'NPS_CLEAR_BUDDY_LIST', value: 1294, module: 'Login' },
  { name: 'NPS_REGISTER_GAME_LOGOUT', value: 1295, module: 'Login' },
  { name: 'NPS_GET_GENERIC_HS_DATA', value: 1296, module: 'Login' },
  { name: 'NPS_PUT_GENERIC_HS_DATA', value: 1297, module: 'Login' },
  { name: 'NPS_DELETE_GAME_PERSONA', value: 1298, module: 'Login' },
  { name: 'NPS_READ_SERVER_DATA_LIST', value: 1299, module: 'Login' },
  { name: 'NPS_DELETE GENERIC_HS_DATA', value: 1300, module: 'Login' },
  { name: 'NPS_GET_PLAYER_RANK', value: 1301, module: 'Login' },
  { name: 'NPS_GET_TOP_PLAYERS', value: 1302, module: 'Login' },
  { name: 'NPS_ADD_BUDDY_BY_NAME', value: 1303, module: 'Login' },
  { name: 'NPS_GET_BUDDY_INFO', value: 1304, module: 'Login' },
  { name: 'NPS_GET_PERSONA_INFO', value: 1305, module: 'Login' },
  { name: 'NPS_GET_LEADER_BOARD', value: 1306, module: 'Login' },
  { name: 'NPS_SRP_USERNAME', value: 1307, module: 'Login' },
  { name: 'NPS_SRP_NGS', value: 1308, module: 'Login' },
  { name: 'NPS_SRP_A', value: 1309, module: 'Login' },
  { name: 'NPS_SRP_B', value: 1310, module: 'Login' },
  { name: 'NPS_SRP_USER_VERIFY', value: 1311, module: 'Login' },
  { name: 'NPS_SRP_SERVER_VERIFY', value: 1312, module: 'Login' },
  { name: 'NPS_FILE_BUG_REPORT', value: 1313, module: 'Login' },
  { name: 'NPS_GET_GENERIC_FIELD_RANKING', value: 1314, module: 'Login' },
  { name: 'NPS_SEND_EMAIL', value: 1315, module: 'Login' },
  { name: 'NPS_RECEIVE_EMAIL', value: 1316, module: 'Login' },
  { name: 'NPS_DELETE_EMAILS', value: 1317, module: 'Login' },
  { name: 'NPS_LIST_EMAILS', value: 1318, module: 'Login' },
  { name: 'NPS_AAI_REQUEST', value: 1328, module: 'Login' },
  { name: 'NPS_AAI_CRACK', value: 1329, module: 'Login' },
  { name: 'NPS_GET_PERSONA_MAPS', value: 1330, module: 'Login' },
  { name: 'NPS_VALIDATE_PERSONA_NAME', value: 1331, module: 'Login' },
  { name: 'NPS_CHECK_TOKEN', value: 1332, module: 'Login' },
  { name: 'NPS_GET_USER_STATUS', value: 1333, module: 'Login' }
]

/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOBBY_COMMANDS = [
  ...NPS_LOBBYCLIENT_COMMANDS,
  ...NPS_LOBBYSERVER_COMMANDS
]

/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_LOGIN_COMMANDS = [...NPS_LOGINCLIENT_COMMANDS]

/**
 * @export
 * @readonly
 * @type {NpsCommandMap[]}
 */
export const NPS_COMMANDS = [
  ...NPS_LOBBY_COMMANDS,
  ...NPS_LOGINCLIENT_COMMANDS,
  { name: 'NPS_CRYPTO_DES_CBC', value: 0x1101, module: 'Lobby' }
]

/**
 * @export
 * @typedef {'recieved' | 'sent' | 'not set'} EMESSAGE_DIRECTION
 *
 */

/**
 *
 *
 * @export
 * @typedef ICoreConfig
 * @property {string} externalHost
 * @property {number[]} [ports=[]]
 */

/**
 * @class
 */
export class MessageNode {
  /**
   *
   *
   * @type {EMESSAGE_DIRECTION}
   * @memberof MessageNode
   */
  direction
  /**
   *
   *
   * @type {number}
   * @memberof MessageNode
   */
  msgNo
  /**
   *
   *
   * @type {number}
   * @memberof MessageNode
   */
  seq
  /**
   *
   *
   * @type {number}
   * @memberof MessageNode
   */
  flags
  /**
   *
   *
   * @type {Buffer}
   * @memberof MessageNode
   */
  data
  /**
   *
   *
   * @type {number}
   * @memberof MessageNode
   */
  dataLength
  /**
   *
   *
   * @type {string}
   * @memberof MessageNode
   */
  mcoSig
  /**
   *
   *
   * @type {number}
   * @memberof MessageNode
   */
  toFrom
  /**
   *
   *
   * @type {number}
   * @memberof MessageNode
   */
  appId
  /**
   *
   * @param {EMESSAGE_DIRECTION} direction
   */
  constructor (direction) {
    this.direction = direction
    this.msgNo = 0
    this.seq = 999
    this.flags = 0
    this.data = Buffer.alloc(0)
    this.dataLength = 0
    this.mcoSig = 'NotAValue'

    this.toFrom = 0
    this.appId = 0
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  deserialize (packet) {
    try {
      this.dataLength = packet.readInt16LE(0)
      this.mcoSig = packet.slice(2, 6).toString()
      this.seq = packet.readInt16LE(6)
      this.flags = packet.readInt8(10)

      // Data starts at offset 11
      this.data = packet.slice(11)

      // Set message number

      this.msgNo = this.data.readInt16LE(0)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name.includes('RangeError')) {
          // This is likeley not an MCOTS packet, ignore
          throw new Error(
            `[MessageNode] Not long enough to deserialize, only ${packet.length.toString()} bytes long`
          )
        } else {
          throw new Error(
            `[MessageNode] Unable to read msgNo from ${packet.toString(
              'hex'
            )}: ${err.toString()}`
          )
        }
      }
      throw new Error(`Unknown error in deserialize: ${String(err)} `)
    }
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    const packet = Buffer.alloc(this.dataLength + 2) // skipcq: JS-0377
    packet.writeInt16LE(this.dataLength, 0)
    packet.write(this.mcoSig, 2)
    packet.writeInt16LE(this.seq, 6)
    packet.writeInt8(this.flags, 10)
    this.data.copy(packet, 11)
    return packet
  }

  /**
   *
   * @param {number} appId
   * @return {void}
   */
  setAppId (appId) {
    this.appId = appId
  }

  /**
   *
   * @param {number} newMessageNo
   * @return {void}
   */
  setMsgNo (newMessageNo) {
    this.msgNo = newMessageNo
    this.data.writeInt16LE(this.msgNo, 0)
  }

  /**
   *
   * @param {number} newSeq
   * @return {void}
   */
  setSeq (newSeq) {
    this.seq = newSeq
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  setMsgHeader (packet) {
    const header = Buffer.alloc(6)
    packet.copy(header, 0, 0, 6)
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  updateBuffer (buffer) {
    this.data = Buffer.from(buffer)
    this.dataLength = buffer.length + 10 // skipcq: JS-0377
    this.msgNo = this.data.readInt16LE(0)
  }

  /**
   *
   * @return {boolean}
   */
  isMCOTS () {
    return this.mcoSig === 'TOMC'
  }

  /**
   *
   * @return {string}
   */
  dumpPacket () {
    let packetContentsArray = this.serialize().toString('hex').match(/../g)
    if (packetContentsArray === null) {
      packetContentsArray = []
    }

    return `Message ${JSON.stringify({
      dataLength: this.dataLength,
      isMCOTS: this.isMCOTS(),
      msgNo: this.msgNo,
      direction: this.direction,
      seq: this.seq,
      flags: this.flags,
      toFrom: this.toFrom,
      appId: this.appId,
      packetContents: packetContentsArray.join('') || ''
    })}`
  }

  /**
   * Returns a formatted representation of the packet as a string
   * @returns {string}
   */
  toString () {
    return this.dumpPacket()
  }

  /**
   *
   * @return {number}
   */
  getLength () {
    return this.dataLength
  }

  /**
   *
   * @param {Buffer} packet
   * @return {void}
   */
  BaseMsgHeader (packet) {
    // WORD msgNo;
    this.msgNo = packet.readInt16LE(0)
  }
}

/**
 * @export
 * @typedef ConnectionWithPackets
 * @property {import('mcos-core').TCPConnection} connection
 * @property {MessageNode[]} packetList
 */

/**
 * @export
 * @typedef ConnectionWithPacket
 * @property {import('mcos-core').TCPConnection} connection
 * @property {MessageNode} packet
 * @property {string} [lastError]
 */

/**
 * @module ClientConnectMsg
 */

/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */
export class ClientConnectMessage {
  msgNo
  personaId
  appId
  customerId
  custName
  personaName
  mcVersion
  /**
   *
   * @param {Buffer} buffer
   */
  constructor (buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0)
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
        this.msgNo = 0
      } else {
        throw new TypeError(
          `[ClientConnectMsg] Unable to read msgNo from ${buffer.toString(
            'hex'
          )}: ${String(error)}` // skipcq: JS-0378
        )
      }
    }

    this.personaId = buffer.readInt32LE(6)

    // Set the appId to the Persona Id
    this.appId = this.personaId

    this.customerId = buffer.readInt32LE(2)
    this.custName = buffer.slice(10, 41).toString()
    this.personaName = buffer.slice(42, 73).toString()
    this.mcVersion = buffer.slice(74)
  }

  /**
   *
   * @return {number}
   */
  getAppId () {
    return this.appId
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket () {
    return `ClientConnectMsg',
        ${JSON.stringify({
          msgNo: this.msgNo.toString(),
          customerId: this.customerId.toString(),
          personaId: this.personaId.toString(),
          custName: this.custName,
          personaName: this.personaName,
          mcVersion: this.mcVersion.toString('hex')
        })}`
  }
}

// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// WORD  msgReply; // message # being replied to (ex: MC_PURCHASE_STOCK_CAR)
// DWORD result; // specific to the message sent, often the reason for a failure
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;

/**
 * @class
 * @property {number} msgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} msgReply
 * @property {Buffer} result
 * @property {Buffer} data
 * @property {Buffer} data2
 */
export class GenericReplyMessage {
  msgNo
  toFrom
  appId
  msgReply
  result
  data
  data2
  /**
   *
   */
  constructor () {
    this.msgNo = 0
    this.toFrom = 0
    this.appId = 0
    this.msgReply = 0
    this.result = Buffer.alloc(4)
    this.data = Buffer.alloc(4)
    this.data2 = Buffer.alloc(4)
  }

  /**
   * Setter data
   * @param {Buffer} value
   * @return {void}
   */
  setData (value) {
    this.data = value
  }

  /**
   * Setter data2
   * @param {Buffer} value
   * @return {void}
   */
  setData2 (value) {
    this.data2 = value
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  deserialize (buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0)
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        throw new TypeError(
          `[GenericReplyMsg] Unable to read msgNo from ${buffer.toString(
            'hex'
          )}: ${String(error)}`
        ) // skipcq: JS-0378
      }
    }

    this.msgReply = buffer.readInt16LE(2)
    this.result = buffer.slice(4, 8)
    this.data = buffer.slice(8, 12)
    this.data2 = buffer.slice(12)
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    const packet = Buffer.alloc(16)
    packet.writeInt16LE(this.msgNo, 0)
    packet.writeInt16LE(this.msgReply, 2)
    this.result.copy(packet, 4)
    this.data.copy(packet, 8)
    this.data2.copy(packet, 12)
    return packet
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setResult (buffer) {
    this.result = buffer
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket () {
    return `GenericReply',
        ${JSON.stringify({
          msgNo: this.msgNo,
          msgReply: this.msgReply,
          result: this.result.toString('hex'),
          data: this.data.toString('hex'),
          tdata2: this.data2.toString('hex')
        })}`
  }
}

/**
 * @module GenericRequestMsg
 */

// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;

/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {Buffer} data
 * @property {Buffer} data2
 * @property {string} serviceName
 */
export class GenericRequestMessage {
  msgNo
  data
  data2
  serviceName
  /**
   *
   */
  constructor () {
    this.msgNo = 0
    this.data = Buffer.alloc(4)
    this.data2 = Buffer.alloc(4)
    this.serviceName = 'mcoserver:GenericRequestMsg'
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  deserialize (buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0)
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else {
        throw new TypeError(
          `[GenericRequestMsg] Unable to read msgNo from ${buffer.toString(
            'hex'
          )}: ${String(error)}` // skipcq: JS-0378
        )
      }
    }

    this.data = buffer.slice(2, 6)
    this.data2 = buffer.slice(6)
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    const packet = Buffer.alloc(16)
    packet.writeInt16LE(this.msgNo, 0)
    this.data.copy(packet, 2)
    this.data2.copy(packet, 6)
    return packet
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket () {
    return `GenericRequest ${JSON.stringify({
      msgNo: this.msgNo,
      data: this.data.toString('hex'),
      data2: this.data2.toString('hex')
    })}`
  }
}

/**
 * Container objest for Stock cars
 * @module StockCar
 */

// DWORD   brandedPartID;
// DWORD   retailPrice;
// WORD    bIsDealOfTheDay;

/**
 * @class
 * @property {number} brandedPartId
 * @property {number} retailPrice
 * @property {0 | 1} bIsDealOfTheDay
 */
export class StockCar {
  brandedPartId
  retailPrice
  bIsDealOfTheDay
  serviceName
  /**
   * @param {number} brandedPartId
   * @param {number} retailPrice
   * @param {0|1} bIsDealOfTheDay
   */
  constructor (brandedPartId, retailPrice, bIsDealOfTheDay) {
    this.brandedPartId = brandedPartId
    this.retailPrice = retailPrice
    this.bIsDealOfTheDay = bIsDealOfTheDay
    this.serviceName = 'mcoserver:StockCar'
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    const packet = Buffer.alloc(10)
    packet.writeInt32LE(this.brandedPartId, 0)
    packet.writeInt32LE(this.retailPrice, 4)
    packet.writeInt16LE(this.bIsDealOfTheDay, 8)
    return packet
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket () {
    return `
        [StockCar]======================================
        brandedPartId:     ${this.brandedPartId}
        retailPrice:       ${this.retailPrice}
        isDealOfTheDay:    ${this.bIsDealOfTheDay}
        [/StockCar]======================================`
  }
}

/**
 * Object for providing information on stock cars
 * @module StockCarInfoMsg
 */

// WORD     msgNo;
// DWORD    starterCash; // when called from the create persona screen,
//                      //  this indicates how much cash a persona starts out with
// DWORD    dealerID;   // for easy match up
// DWORD    brand;
// WORD     noCars;
// BYTE     moreToCome;     // if 1, expect another msg, otherwise don't
// StockCar carInfo[1];

/**
 * @class
 * @property {number} msgNo
 * @property {number} starterCash
 * @property {number} dealerId
 * @property {number} brand
 * @property {number} noCars
 * @property {number} moreToCome
 * @property {StockCar[]} StockCarList
 */
export class StockCarInfoMessage {
  msgNo
  starterCash
  dealerId
  brand
  noCars
  moreToCome
  /**
   *
   * @type {StockCar[]}
   * @memberof StockCarInfoMessage
   */
  StockCarList = []
  /**
   *
   *
   * @type {string}
   * @memberof StockCarInfoMessage
   */
  serviceName
  /**
   * Creates an instance of StockCarInfoMsg.
   * @class
   * @param {number} starterCash
   * @param {number} dealerId
   * @param {number} brand
   * @memberof StockCarInfoMsg
   */
  constructor (starterCash, dealerId, brand) {
    this.msgNo = 141
    this.starterCash = starterCash
    this.dealerId = dealerId
    this.brand = brand
    /** Number of cars */
    this.noCars = 1
    /** @type {0|1} */
    this.moreToCome = 0
    /** @type {module:StockCar} */
    this.StockCarList = []
    this.serviceName = 'mcoserver:StockCarInfoMsg'
  }

  /**
   *
   * @param {StockCar} car
   * @return {void}
   */
  addStockCar (car) {
    this.StockCarList.push(car)
    this.noCars = this.StockCarList.length
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    // This does not count the StockCar array
    const packet = Buffer.alloc((17 + 9) * this.StockCarList.length)
    packet.writeInt16LE(this.msgNo, 0)
    packet.writeInt32LE(this.starterCash, 2)
    packet.writeInt32LE(this.dealerId, 6)
    packet.writeInt32LE(this.brand, 10)
    packet.writeInt16LE(this.noCars, 14)
    packet.writeInt8(this.moreToCome, 16)
    if (this.StockCarList.length > 0) {
      for (let i = 0; i < this.StockCarList.length; i++) {
        const offset = 10 * i
        const record = this.StockCarList[i]
        if (typeof record !== 'undefined') {
          record.serialize().copy(packet, 17 + offset)
        }
      }
    }

    return packet
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket () {
    return `${JSON.stringify({
      msgNo: this.msgNo,
      starterCash: this.starterCash,
      dealerId: this.dealerId,
      brand: this.brand,
      noCars: this.noCars,
      moreToCome: this.moreToCome,
      stockCarList: this.StockCarList.toString()
    })}`
  }
}

/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {EMESSAGE_DIRECTION} direction
 * @property {string} serviceName
 */
export class NPSMessage {
  msgNo
  msgVersion
  reserved
  content
  msgLength
  direction
  serviceName
  /**
   *
   * @param {EMESSAGE_DIRECTION} direction - the direction of the message flow
   */
  constructor (direction) {
    this.msgNo = 0
    this.msgVersion = 0
    this.reserved = 0
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04])
    this.msgLength = this.content.length + 12 // skipcq: JS-0377
    this.direction = direction
    this.serviceName = 'mcoserver:NPSMsg'
  }

  /**
   *
   * @param {Buffer} buffer
   * @return {void}
   */
  setContent (buffer) {
    this.content = buffer
    this.msgLength = this.content.length + 12 // skipcq: JS-0377
  }

  /**
   *
   * @return {Buffer}
   */
  getContentAsBuffer () {
    return this.content
  }

  /**
   *
   * @return {string}
   */
  getPacketAsString () {
    return this.serialize().toString('hex')
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    try {
      const packet = Buffer.alloc(this.msgLength)
      packet.writeInt16BE(this.msgNo, 0)
      packet.writeInt16BE(this.msgLength, 2)
      if (this.msgLength > 4) {
        packet.writeInt16BE(this.msgVersion, 4)
        packet.writeInt16BE(this.reserved, 6)
      }

      if (this.msgLength > 8) {
        packet.writeInt32BE(this.msgLength, 8)
        this.content.copy(packet, 12)
      }

      return packet
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(
          `[NPSMsg] Error in serialize(): ${error.toString()}`
        )
      }

      throw new Error('[NPSMsg] Error in serialize(), error unknown')
    }
  }

  /**
   *
   * @param {Buffer} packet
   * @return {NPSMessage}
   * @memberof NPSMessage
   */
  deserialize (packet) {
    this.msgNo = packet.readInt16BE(0)
    this.msgLength = packet.readInt16BE(2)
    this.msgVersion = packet.readInt16BE(4)
    this.content = packet.slice(12)
    return this
  }

  /**
   *
   * @param {string} messageType
   * @return {string}
   */
  dumpPacketHeader (messageType) {
    return `NPSMsg/${messageType},
          ${JSON.stringify({
            direction: this.direction,
            msgNo: this.msgNo.toString(16),
            msgVersion: this.msgVersion,
            msgLength: this.msgLength
          })}`
  }

  /**
   * DumpPacket
   * @return {string}
   * @memberof NPSMsg
   */
  dumpPacket () {
    return `NPSMsg/NPSMsg,
          ${JSON.stringify({
            direction: this.direction,
            msgNo: this.msgNo.toString(16),
            msgVersion: this.msgVersion,
            msgLength: this.msgLength,
            content: this.content.toString('hex'),
            serialized: this.serialize().toString('hex')
          })}`
  }

  /**
   *
   * @return {INPSMessageJSON}
   */
  toJSON () {
    return {
      msgNo: this.msgNo,
      contextId: '',
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString('hex'),
      direction: this.direction,
      rawBuffer: this.content.toString('hex'),
      opCode: 0,
      sessionkey: ''
    }
  }
}

/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {PersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export class NPSPersonaMapsMessage extends NPSMessage {
  /**
   *
   * @type {PersonaRecord[]}
   * @memberof NPSPersonaMapsMessage
   */
  personas = []
  personaSize
  personaCount
  /**
   *
   * @param {EMESSAGE_DIRECTION} direction
   */
  constructor (direction) {
    super(direction)

    /** @type {PersonaRecord[]} */
    this.personas = []
    // Public personaSize = 1296;
    this.personaSize = 38
    this.msgNo = 0x6_07
    this.personaCount = 0
    this.serviceName = 'mcoserver:NPSPersonaMapsMsg'
  }

  /**
   *
   * @param {PersonaRecord[]} personas
   * @return {void}
   */
  loadMaps (personas) {
    this.personaCount = personas.length
    this.personas = personas
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt8 (buf) {
    return buf.readInt8(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt32 (buf) {
    return buf.readInt32BE(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {string}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeString (buf) {
    return buf.toString('utf8')
  }

  /**
   *
   * @override
   * @return {Buffer}
   */
  serialize () {
    let index = 0
    // Create the packet content
    // const packetContent = Buffer.alloc(40);
    const packetContent = Buffer.alloc(this.personaSize * this.personaCount)

    for (const persona of this.personas) {
      // This is the persona count
      packetContent.writeInt16BE(
        this.personaCount,
        this.personaSize * index + 0
      )

      // This is the max persona count (confirmed - debug)
      packetContent.writeInt8(
        this.deserializeInt8(persona.maxPersonas),
        this.personaSize * index + 5
      )

      // PersonaId
      packetContent.writeUInt32BE(
        this.deserializeInt32(persona.id),
        this.personaSize * index + 8
      )

      // Shard ID
      // packetContent.writeInt32BE(this.shardId, 1281);
      packetContent.writeInt32BE(
        this.deserializeInt32(persona.shardId),
        this.personaSize * index + 12
      )

      // Length of Persona Name
      packetContent.writeInt16BE(
        persona.name.length,
        this.personaSize * index + 20
      )

      // Persona Name = 30-bit null terminated string
      packetContent.write(
        this.deserializeString(persona.name),
        this.personaSize * index + 22
      )
      index++
    }

    // Build the packet
    return packetContent
  }

  /**
   *
   * @override
   * @return {string}
   */
  dumpPacket () {
    let message = ''
    message = message.concat(this.dumpPacketHeader('NPSPersonaMapsMsg'))
    message = message.concat(
      `personaCount:        ${this.personaCount.toString()}`
    )
    for (const persona of this.personas) {
      message = message.concat(
        `
          maxPersonaCount:     ${this.deserializeInt8(
            persona.maxPersonas
          ).toString()}
          id:                  ${this.deserializeInt32(persona.id).toString()}
          shardId:             ${this.deserializeInt32(
            persona.shardId
          ).toString()}
          name:                ${this.deserializeString(
            persona.name
          ).toString()}
          Packet as hex:       ${this.getPacketAsString()}`
      )

      // TODO: Work on this more

      message = message.concat(
        '[/NPSPersonaMapsMsg]======================================'
      )
    }
    return message
  }
}

/**
 *
 * @global
 * @typedef {Object} INPSMessageJSON
 * @property {number} msgNo
 * @property {number | null} opCode
 * @property {number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {EMESSAGE_DIRECTION} direction
 * @property {string | null } sessionkey
 * @property {string} rawBuffer
 */

/**
 *
 *
 * @export
 * @typedef {object} NPSMessageValues
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {EMESSAGE_DIRECTION} direction
 * @property {string} serviceName
 */

/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
export class NPSUserStatus extends NPSMessage {
  sessionkey
  opCode
  contextId
  buffer
  /**
   *
   * @param {Buffer} packet
   */
  constructor (packet) {
    super('recieved')
    this.sessionkey = ''

    // Save the NPS opCode
    this.opCode = packet.readInt16LE(0)

    // Save the contextId
    this.contextId = packet.slice(14, 48).toString()

    // Save the raw packet
    this.buffer = packet
  }

  /**
   * Load the RSA private key
   *
   * @param {string} privateKeyPath
   * @return {string}
   */
  fetchPrivateKeyFromFile (privateKeyPath) {
    try {
      statSync(privateKeyPath)
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(
          `[npsUserStatus] Error loading private key: ${error.message.toString()}`
        )
      }

      throw new Error(
        '[npsUserStatus] Error loading private key, error unknown'
      )
    }

    return readFileSync(privateKeyPath).toString()
  }

  /**
   * ExtractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   *
   * @param {Buffer} packet
   * @return {void}
   */
  extractSessionKeyFromPacket (packet) {
    if (!APP_CONFIG.MCOS.CERTIFICATE.PRIVATE_KEY_FILE) {
      throw new Error('Please set MCOS__CERTIFICATE__PRIVATE_KEY_FILE')
    }
    // Decrypt the sessionkey
    const privateKey = this.fetchPrivateKeyFromFile(
      APP_CONFIG.MCOS.CERTIFICATE.PRIVATE_KEY_FILE
    )

    const sessionkeyString = Buffer.from(
      packet.slice(52, -10).toString('utf8'),
      'hex'
    )
    const decrypted = privateDecrypt(privateKey, sessionkeyString)
    this.sessionkey = decrypted.slice(2, -4).toString('hex')
  }

  /**
   *
   * @override
   * @return {INPSMessageJSON}
   */
  toJSON () {
    return {
      msgNo: this.msgNo,
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString('hex'),
      direction: this.direction,
      opCode: this.opCode,
      contextId: this.contextId,
      sessionkey: this.sessionkey,
      rawBuffer: this.buffer.toString('hex')
    }
  }

  /**
   * @override
   * @return {string}
   */
  dumpPacket () {
    let message = this.dumpPacketHeader('NPSUserStatus')
    message = message.concat(
      `NPSUserStatus,
        ${JSON.stringify({
          contextId: this.contextId,
          sessionkey: this.sessionkey
        })}`
    )
    return message
  }
}

/**
 * This is the response packet sent on the login port in response to a UserLogin
 *
 * @return {Buffer}
 */
export function premadeLogin () {
  // TODO: Generate a dynamic login response message
  return Buffer.from([
    // Live Packet
    0x06, // +0
    0x02,
    0x01,
    0x01,
    0x21,
    0xf9,
    0x17,
    0xf2,
    0x28,
    0x85,
    0xd1,
    0x47,
    0xab,
    0x01,
    0x00,
    0x00,
    0xec, // +16
    0xf7,
    0xba,
    0x7f,
    0x45,
    0x62,
    0x53,
    0x62,
    0xfe,
    0x53,
    0x7b,
    0x03,
    0x11,
    0x27,
    0x72,
    0xbd,
    0xa3, // +32
    0x3d,
    0xa3,
    0x06,
    0x52,
    0x3a,
    0xfb,
    0x7c,
    0xd6,
    0xd5,
    0xdb,
    0x85,
    0x3d,
    0x73,
    0x66,
    0x8f,
    0x26, // +48
    0x69,
    0x65,
    0x07,
    0x37,
    0x7a,
    0xe8,
    0xc9,
    0x45,
    0x99,
    0x6a,
    0xaf,
    0xe5,
    0xdf,
    0x1c,
    0xbd,
    0x1f, // +64
    0x30,
    0xdc,
    0x5a,
    0x1a,
    0x29,
    0x4d,
    0xab,
    0x3d,
    0x0b,
    0x15,
    0xdf,
    0x33,
    0x32,
    0xdc,
    0x1e,
    0xe8,
    0x75,
    0x8b,
    0x54,
    0x34,
    0x26,
    0x0d,
    0x3a,
    0xa2,
    0xcf,
    0x2d,
    0x26,
    0x3d,
    0x7d,
    0xf7,
    0xec,
    0x3c, // +96
    0x52,
    0xb2,
    0x34,
    0x57, // +100
    0xc1,
    0x07,
    0xd7,
    0x6a,
    0xd4,
    0xdc,
    0x1e,
    0xd0,
    0x07,
    0x31,
    0xdd,
    0xe7,
    0x92,
    0x4b,
    0xf2,
    0x56,
    0xc8,
    0xb1,
    0x00,
    0x4d,
    0xd6,
    0xe8,
    0x79,
    0x14,
    0xf0,
    0x72,
    0x71,
    0x41, // +128
    0x6d,
    0xce,
    0x11,
    0xe2,
    0xae,
    0x9d,
    0xec,
    0x55,
    0x6e,
    0xdd,
    0xdf,
    0xfa,
    0xdb,
    0x09,
    0x74,
    0x61,
    0x8c,
    0x67,
    0xf6,
    0xf7,
    0x65,
    0xf3, // +150
    0x98,
    0xfd,
    0x6d,
    0x97,
    0x4b,
    0x3f,
    0x54,
    0x85,
    0x4f,
    0x2a,
    0x69,
    0x02,
    0xbe,
    0xb6, // +164
    0xd4,
    0xa3,
    0x2f,
    0x5b,
    0x86,
    0x58,
    0x19,
    0xbd,
    0xa9,
    0x9e,
    0x21,
    0x63,
    0x50,
    0x9c,
    0x43,
    0x83,
    0x42,
    0xfa,
    0xa5,
    0x81,
    0x5c,
    0x1f,
    0xad,
    0x06,
    0x64,
    0x64,
    0x7f,
    0xe1,
    0x2b,
    0xdb,
    0xd0,
    0xee, // +196
    0xa6,
    0x04,
    0x11,
    0x9a, // +200
    0x00, // (0xf6 was old val)
    0x00, // (0xc3 was old val)
    0x00, // (0x50 was old val)
    0x00, // (0x34 was old val)
    0xb4,
    0x43,
    0xf5,
    0x00, // +208 = Use Connection Queue (0xd4 was old val)
    0x00, // (0x57 was old val)
    0x27,
    0x1f,
    0x07,
    0xa3,
    0xbf,
    0x17,
    0x3d,
    0x9b,
    0x2e,
    0xde,
    0xae,
    0xdf,
    0x46,
    0x2f,
    0x30,
    0x11,
    0x70,
    0xbe,
    0x5f,
    0x90,
    0x46,
    0x0c,
    0x28, // +232
    0x33,
    0xf0,
    0x08,
    0x88,
    0x03,
    0x05,
    0xbf,
    0xe5,
    0x53,
    0xcd,
    0xfa,
    0x45,
    0x77,
    0x2e,
    0x90,
    0xf3,
    0x4d,
    0xd1, // +250
    0x44,
    0x89,
    0x00, // (0x8c was old val)
    0x00, // (0x98 was old val)
    0x00 // (0xa6 was old val)
  ])
}

/**
 * @class
 * @extends {NPSMessage}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo extends NPSMessage {
  userId
  userName
  userData
  /**
   *
   * @param {EMESSAGE_DIRECTION} direction
   */
  constructor (direction) {
    super(direction)
    this.userId = 0
    this.userName = Buffer.from([0x00]) // 30 length
    this.userData = Buffer.from([0x00]) // 64 length
    this.serviceName = 'mcoserver:NPSUserInfo'
  }

  /**
   *
   * @override
   * @param {Buffer} rawData
   * @return {NPSUserInfo}
   */
  deserialize (rawData) {
    this.userId = rawData.readInt32BE(4)
    this.userName = rawData.slice(8, 38)
    this.userData = rawData.slice(38)
    return this
  }

  /**
   * @return {string}
   */
  dumpInfo () {
    let message = this.dumpPacketHeader('NPSUserInfo')
    const { userId, userName, userData } = this
    const userIdString = userId.toString()
    const userNameString = userName.toString('utf8')
    const userDataStringHex = userData.toString('hex')
    message = message.concat(
      `UserId:        ${userIdString}
         UserName:      ${userNameString}
         UserData:      ${userDataStringHex}  
         [/NPSUserInfo]======================================`
    ) // skipcq: JS-0378
    return message
  }
}
