// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { logger } from '../../mcos-shared/src/logger/index.js'
import type { BufferWithConnection, GServiceResponse } from '../../mcos-shared/src/types/index.js'
import { handleData } from './internal.js'
import { errorMessage } from '../../mcos-shared/src/index.js'
import { _generateSessionKeyBuffer } from './handlers/requestConnectGameServer.js'

const log = logger.child({ service: 'mcoserver:LobbyServer' })







  // /**
  //  * @depreciated Please use {@see receiveLobbyData()} instead
  //  * @param {{connection: import("mcos-shared").TCPConnection, data: Buffer}} rawPacket
  //  * @return {Promise<import("mcos-shared").TCPConnection>}
  //  */
  // export async function lobbyDataHandler (rawPacket: { connection: TCPConnection; data: Buffer }): Promise<TCPConnection> {
  //   const { localPort, remoteAddress } = rawPacket.connection
  //   log.debug(
  //     `Received Lobby packet: ${JSON.stringify({ localPort, remoteAddress })}`
  //   )
  //   const { connection, data } = rawPacket
  //   const requestCode = data.readUInt16BE(0).toString(16)

  //   switch (requestCode) {
  //     // _npsRequestGameConnectServer
  //     case '100': {
  //       const responsePacket = await _npsRequestGameConnectServer(
  //         connection,
  //         data
  //       )
  //       log.debug(
  //         `Connect responsePacket's data prior to sending: ${JSON.stringify({
  //           data: responsePacket.getPacketAsString()
  //         })}`
  //       )
  //       // BUG: #1171 Client sometimes crashes when this packet is sent
  //       try {
  //         log.trace(
  //           `[legacy] Raw bytes in _npsRequestGameConnectServer(pre-write): ${toHex(
  //             responsePacket.serialize()
  //           )}`
  //         )
  //         const updatedConnection = npsSocketWriteIfOpen(
  //           connection,
  //           responsePacket.serialize()
  //         )
  //         log.trace(
  //           `[legacy] Raw bytes in _npsRequestGameConnectServer(post-write): ${toHex(
  //             responsePacket.serialize()
  //           )}`
  //         )
  //         return updatedConnection
  //       } catch (error) {
  //         if (error instanceof Error) {
  //           throw new Error(`Unable to send Connect packet: ${error.message}`)
  //         }
  //         throw new Error('Unable to send Connect packet: unknown error')
  //       }
  //     }

  //     // NpsHeartbeat

  //     case '217': {
  //       const responsePacket = _npsHeartbeat()
  //       log.debug(
  //         `Heartbeat responsePacket's data prior to sending: ${JSON.stringify({
  //           data: responsePacket.getPacketAsString()
  //         })}`
  //       )
  //       return npsSocketWriteIfOpen(connection, responsePacket.serialize())
  //     }

  //     // NpsSendCommand

  //     case '1101': {
  //       // This is an encrypted command
  //       // Fetch session key

  //       const updatedConnection = sendCommand(connection, data)
  //       const { encryptedCmd } = updatedConnection

  //       if (encryptedCmd === undefined) {
  //         throw new Error(
  //           `Error with encrypted command, dumping connection: ${JSON.stringify(
  //             { updatedConnection }
  //           )}`
  //         )
  //       }

  //       log.debug(
  //         `encrypedCommand's data prior to sending: ${JSON.stringify({
  //           data: encryptedCmd.toString('hex')
  //         })}`
  //       )
  //       return npsSocketWriteIfOpen(connection, encryptedCmd)
  //     }

  //     default:
  //       throw new Error(
  //         `Unknown code ${requestCode} was received on port 7003`
  //       )
  //   }
  // }



/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {BufferWithConnection} dataConnection
 * @return {Promise<GServiceResponse>}
 */
export async function receiveLobbyData (dataConnection: BufferWithConnection): Promise<GServiceResponse> {
  try {
    return { err: null, response: await handleData(dataConnection) }
  } catch (error) {
    const errMessage = `There was an error in the lobby service: ${errorMessage(
      error
    )}`
    log.error(errMessage)
    return { err: new Error(errMessage), response: undefined }
  }
}
