// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from 'net'
import { Logger } from 'winston'
import { appSettings } from '../../../config/app-settings'
import { DatabaseManager } from '../../shared/DatabaseManager'
import { IAppSettings, IRawPacket } from '../../types'
import { ConnectionObj } from './ConnectionObj'
import { defaultHandler } from './MCOTS/TCPManager'
import { NPSPacketManager } from './npsPacketManager'
import Debug from 'debug'
import { VError } from 'verror'
import { NPS_COMMANDS } from '../../structures'

const debug = Debug('mcoserver:ConnectionManager')

export class ConnectionMgr {
  logger: Logger
  config: IAppSettings
  databaseMgr: DatabaseManager
  connections: ConnectionObj[]
  newConnectionId: number
  banList: string[]

  /**
   * Creates an instance of ConnectionMgr.
   * @param {module:Logger.logger} logger
   * @param {module:DatabaseManager} databaseManager
   */
  constructor (logger: Logger, databaseManager: DatabaseManager) {
    this.logger = logger.child({ service: 'mcoserver:ConnectionMgr' })
    this.config = appSettings
    this.databaseMgr = databaseManager
    /**
     * @type {ConnectionObj[]}
     */
    this.connections = []
    this.newConnectionId = 1
    /**
     * @type {string[]}
     */
    this.banList = []
  }

  /**
   * Check incoming data and route it to the correct handler based on localPort
   */
  async processData (rawPacket: IRawPacket): Promise<ConnectionObj> {
    const npsPacketManager = new NPSPacketManager(this.databaseMgr)

    const { remoteAddress, localPort, data } = rawPacket

    // Log the packet as debug
    debug(
      'logging raw packet',
      {
        remoteAddress,
        localPort,
        data: data.toString('hex')
      }
    )

    switch (localPort) {
      case 8226:
      case 8228:
      case 7003:
        debug(
          'Recieved NPS packet',
          {
            opCode: rawPacket.data.readInt16BE(0),
            msgName: `${npsPacketManager.msgCodetoName(
              rawPacket.data.readInt16BE(0)
            )} / ${this.getNameFromOpCode(rawPacket.data.readInt16BE(0))}`,
            localPort
          }
        )
        try {
          return await npsPacketManager.processNPSPacket(rawPacket)
        } catch (error) {
          throw new VError(`Error in connectionMgr::processData ${error}`)
        }
      case 43300:
        debug(
          'Recieved MCOTS packet'
          // {
          //   opCode: rawPacket.data.readInt16BE(0),
          //   msgName: `${npsPacketManager.msgCodetoName(
          //     rawPacket.data.readInt16BE(0)
          //   )} / ${this.getNameFromOpCode(rawPacket.data.readInt16BE(0))}`,
          //   localPort
          // }
        )
        return defaultHandler(rawPacket)
      default:
        throw new VError(`We received a packet on port ${localPort}. We don't what to do yet, going to throw so the message isn't lost. ${rawPacket}`)
    }
  }

  /**
   * Get the name connected to the NPS opcode
   */
  getNameFromOpCode (opCode: number): string {
    const opCodeName = NPS_COMMANDS.find((code) => {
      return code.value === opCode
    })
    if (opCodeName === undefined) {
      throw new VError(`Unable to locate name for opCode ${opCode}`)
    }
    return opCodeName.name
  }

  /**
   * Get the name connected to the NPS opcode
   */
  getOpcodeFromName (name: string): number {
    const opCode = NPS_COMMANDS.find((code) => {
      return code.name === name
    })
    if (opCode === undefined) {
      throw new VError(`Unable to locate opcode for name ${name}`)
    }
    return opCode.value
  }

  /**
   *
   * @return {string[]}
   */
  getBans (): string[] {
    return this.banList
  }

  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {string} remoteAddress
   * @param {number} localPort
   * @memberof ConnectionMgr
   * @return {ConnectionObj | undefined}
   */
  findConnectionByAddressAndPort (remoteAddress: string, localPort: number): ConnectionObj | undefined {
    const results = this.connections.find(connection => {
      const match =
        remoteAddress === connection.remoteAddress &&
        localPort === connection.localPort
      return match
    })
    return results
  }

  /**
   * Locate connection by id in the connections array
   * @param {string} connectionId
   * @return {ConnectionObj | undefined}
   */
  findConnectionById (connectionId: string): ConnectionObj {
    const results = this.connections.find(connection => {
      const match = connectionId === connection.id
      return match
    })
    if (results === undefined) {
      throw new VError(`Unable to locate connection for id ${connectionId}`)
    }
    return results
  }

  /**
   *
   * @param {string} address
   * @param {number} port
   * @param {ConnectionObj} newConnection
   * @memberof ConnectionMgr
   */
  async _updateConnectionByAddressAndPort (address: string, port: number, newConnection: ConnectionObj): Promise<void> {
    if (newConnection === undefined) {
      throw new VError(
        `Undefined connection: ${JSON.stringify({
          remoteAddress: address,
          localPort: port
        })}`

      )
    }
    try {
      const index = this.connections.findIndex(
        connection =>
          connection.remoteAddress === address && connection.localPort === port
      )
      this.connections.splice(index, 1)
      this.connections.push(newConnection)
    } catch (error) {
      this.logger.error(
        'Error updating connection',
        { error, connections: this.connections }
      )
    }
  }

  /**
   * Return an existing connection, or a new one
   *
   * @param {Socket} socket
   * @return {ConnectionObj}
   * @memberof ConnectionMgr
   */
  findOrNewConnection (socket: Socket): ConnectionObj {
    const { remoteAddress, localPort } = socket
    if (!remoteAddress) {
      throw new VError(
        `No address in socket: ${JSON.stringify({
          remoteAddress,
          localPort
        })}`

      )
    }
    const con = this.findConnectionByAddressAndPort(remoteAddress, localPort)
    if (con !== undefined) {
      this.logger.info(
        `[connectionMgr] I have seen connections from ${remoteAddress} on ${localPort} before`
      )
      con.sock = socket
      return con
    }

    const newConnection = new ConnectionObj(
      `${Date.now().toString()}_${this.newConnectionId}`,
      socket,
      this
    )
    this.logger.info(
      `[connectionMgr] I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`
    )
    this.connections.push(newConnection)
    return newConnection
  }

  /**
   *
   * @memberof ConnectionMgr
   */
  resetAllQueueState (): void {
    this.connections = this.connections.map(connection => {
      connection.inQueue = true
      return connection
    })
  }

  /**
   * Dump all connections for debugging
   *
   * @return {ConnectionObj[]}
   * @memberof ConnectionMgr
   */
  dumpConnections (): ConnectionObj[] {
    return this.connections
  }
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
  console.trace()
  // application specific logging, throwing an error, or other logic here
  process.exit(-1)
})
