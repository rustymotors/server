import { selectOrCreateEncryptors, toHex } from 'mcos-shared/src/index.js'
import { MessagePacket } from 'mcos-shared/src/structures/MessagePacket.js'
import { BufferWithConnection, EncryptionSession, GSMessageArrayWithConnection, NPSMessage, NPSUserInfo } from 'mcos-shared/src/types/index.js'
import { DatabaseManager } from '../../../mcos-database/src/index.js'
import { getPersonasByPersonaId } from '../../../mcos-persona/src/index.js'
import { logger } from '../../../mcos-shared/src/logger/index.js'


const log = logger.child({ service: 'mcos:lobby' })

/**
   * @param {string} key
   * @return {Buffer}
   */
 export function _generateSessionKeyBuffer (key: string): Buffer {
  const nameBuffer = Buffer.alloc(64)
  Buffer.from(key, 'utf8').copy(nameBuffer)
  return nameBuffer
}

/**
   * Handle a request to connect to a game server packet
   *
   * @private
   * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
   * @return {Promise<NPSMessage>}
   */
 export async function _npsRequestGameConnectServer (dataConnection: BufferWithConnection): Promise<GSMessageArrayWithConnection> {
  log.trace(`[inner] Raw bytes in _npsRequestGameConnectServer: ${toHex(dataConnection.data)}`)

  log.debug(
      `_npsRequestGameConnectServer: ${JSON.stringify({
        remoteAddress: dataConnection.connection.remoteAddress,
        localPort: dataConnection.connection.localPort,
        data: dataConnection.data.toString('hex')
      })}`
  )

  // since the data is a buffer at this point, let's place it in a message structure
  const inboundMessage = MessagePacket.fromBuffer(dataConnection.data)

  log.debug(`message buffer (${inboundMessage.buffer.toString('hex')})`)

  // Return a _NPS_UserInfo structure
  const userInfo = new NPSUserInfo('recieved')
  userInfo.deserialize(dataConnection.data)
  userInfo.dumpInfo()

  const personas = await getPersonasByPersonaId(
    userInfo.userId
  )
  if (typeof personas[0] === 'undefined') {
    throw new Error('No personas found.')
  }

  const { customerId } = personas[0]

  // Set the encryption keys on the lobby connection
  const databaseManager = DatabaseManager.getInstance()
  const keys = await databaseManager
    .fetchSessionKeyByCustomerId(customerId)
    .catch((/** @type {unknown} */ error: unknown) => {
      if (error instanceof Error) {
        log.debug(
            `Unable to fetch session key for customerId ${customerId.toString()}: ${
              error.message
            })}`
        )
      }
      log.error(
          `Unable to fetch session key for customerId ${customerId.toString()}: unknown error}`
      )
      return undefined
    })
  if (keys === undefined) {
    throw new Error('Error fetching session keys!')
  }

  const encryptionSession: EncryptionSession = selectOrCreateEncryptors(dataConnection.connection, keys)

  dataConnection.connection.encryptionSession = encryptionSession

  const packetContent = Buffer.alloc(72)

  // This response is a NPS_UserStatus

  // Ban and Gag

  // NPS_USERID - User ID - persona id - long
  Buffer.from([0x00, 0x84, 0x5f, 0xed]).copy(packetContent)

  // SessionKeyStr (32)
  _generateSessionKeyBuffer(keys.sessionkey).copy(packetContent, 4)

  // SessionKeyLen - int
  packetContent.writeInt16BE(32, 66)

  // Build the packet
  const packetResult = new NPSMessage('sent')
  packetResult.msgNo = 0x1_20
  packetResult.setContent(packetContent)
  packetResult.dumpPacket()

  const loginResponsePacket = MessagePacket.fromBuffer(packetResult.serialize())

  log.debug(`!!! outbound lobby login response packet: ${loginResponsePacket.buffer.toString("hex")}`)
  return {
    connection: dataConnection.connection,
    messages: [packetResult],
  };
}
