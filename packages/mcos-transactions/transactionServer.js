// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from 'mcos-shared/logger'
import {
  ClientConnectMessage,
  GenericReplyMessage,
  GenericRequestMessage,
  MessageNode,
  StockCar,
  StockCarInfoMessage
} from 'mcos-shared/types'
import { DatabaseManager } from 'mcos-database'
import { errorMessage } from 'mcos-shared'

const log = logger.child({ service: 'mcoserver:MCOTSServer' })

/**
 * Manages the game database server
 * @classdesc
 */
export class MCOTServer {
  /**
   *
   *
   * @private
   * @static
   * @type {MCOTServer}
   * @memberof MCOTServer
   */
  static _instance

  /**
   * Get the instance of the transactions server
   * 
   * Please use {@link MCOTServer.getTransactionServer()}
   * @returns {MCOTServer}
   */
  static getTransactionServer () {
    if (!MCOTServer._instance) {
      MCOTServer._instance = new MCOTServer()
    }
    return MCOTServer._instance
  }

  /**
   * Entry point for packets into the transactions server
   * @param {import("mcos-shared/types").UnprocessedPacket} rawPacket
   * @returns {Promise<{errMessage: string | null, data: import('mcos-shared/types').BufferWithConnection | null}>}
   */
  // async defaultHandler (rawPacket) {
  //   const { connection, data } = rawPacket
  //   const { remoteAddress, localPort } = connection
  //   const messageNode = new MessageNode('recieved')
  //   messageNode.deserialize(data)

  //   log.debug(
  //     `Received TCP packet',
  //   ${JSON.stringify({
  //     localPort,
  //     remoteAddress,
  //     direction: messageNode.direction,
  //     data: rawPacket.data.toString('hex')
  //   })}`
  //   )
  //   messageNode.dumpPacket()

  //   const processedPacket = messageReceived(messageNode, connection)
  //   log.debug('Back in transacation server')

  //   if ((await processedPacket).err || (await processedPacket).data === null) {
  //     return { err: (await processedPacket).err, data: null }
  //   }

  //   return { err: null, data: (await processedPacket).data }
  // }
}

export const getTransactionServer = MCOTServer.getTransactionServer
