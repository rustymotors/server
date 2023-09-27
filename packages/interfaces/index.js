/* eslint-disable no-unused-vars */
import { Socket } from "node:net";
import { ServerError } from "../shared/errors/ServerError.js";
import { Cipher, Decipher } from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";

/**
 * @module interfaces
 */

export const name = "interfaces";

/**
 * @exports
 * @interface
 * @typedef {object} SerializedObject
 * @property {function(): Buffer} serialize
 * @property {function(): number} serializeSize
 */

export const SerializedObject = {
    serialize() {
        throw new ServerError("Not implemented");
    },
    serializeSize() {
        throw new ServerError("Not implemented");
    },
};

/**
 * @typedef {object} GameMessageHeader
 * @extends {SerializedObject}
 * @property {number} msgid
 * @property {number} msglen
 * @property {number} version
 * @property {number} reserved
 * @property {number} checksum
 * @property {function(Buffer): GameMessageHeader} deserialize
 */

/**
 * @typedef {object} ClientMessageHeader
 * @property {number} length
 * @property {string} signature
 * @property {function(): Buffer} serialize
 */

/**
 * @typedef {object} ClientMessage
 * @extends {SerializedObject}
 * @property {number} toFrom
 * @property {string} connectionId
 * @property {number} appId
 * @property {number} sequence
 * @property {number} flags
 * @property {Buffer} rawBuffer
 * @property {number} opCode
 * @property {ClientMessageHeader} header
 * @property {function(): Buffer} serialize
 * @property {function(): string} toString
 * @property {function(Buffer): void} deserialize
 */

/**
 * @typedef {object} EncryptionSession
 * @property {string} connectionId
 * @property {string} remoteAddress
 * @property {number} localPort
 * @property {string} sessionKey
 * @property {string} sKey
 * @property {Cipher} gsCipher
 * @property {Decipher} gsDecipher
 * @property {Cipher} tsCipher
 * @property {Decipher} tsDecipher
 */

/**
 * @typedef {object} ClientConnection
 * @property {number} status
 * @property {number} appID
 * @property {string} id
 * @property {Socket} socket
 * @property {string} remoteAddress
 * @property {number} seq
 * @property {number} personaId
 * @property {number} lastMessageTimestamp
 * @property {boolean} inQueue
 * @property {EncryptionSession} encryptionSession
 * @property {boolean} useEncryption
 * @property {number} port
 * @property {string} ip
 */

/**
 * @typedef {object} SocketWithConnectionInfo
 * @property {string} connectionId
 * @property {Socket} socket
 * @property {number} seq
 * @property {string} id
 * @property {string} remoteAddress
 * @property {number} localPort
 * @property {number} personaId
 * @property {number} lastMessageTimestamp
 * @property {boolean} inQueue
 * @property {EncryptionSession} encryptionSession
 * @property {boolean} useEncryption
 */

/**
 * @typedef {object} DatabaseManager
 * @property {function(number, string, string, string): Promise<void>} updateSessionKey
 * @property {function(number): Promise<SessionKeys>} fetchSessionKeyByCustomerId
 */

/**
 * @typedef {object} ConnectionRecord
 * @property {number} customerId
 * @property {string} connectionId
 * @property {string} sessionKey
 * @property {string} sKey
 * @property {string} contextId
 */

/**
 * @typedef {object} SessionKeys
 * @property {string} sessionKey - 64 bytes
 * @property {string} sKey - 16 bytes
 */

/**
 * @typedef {object} TConnection
 * @property {string} connectionId
 * @property {number} localPort
 * @property {string} remoteAddress
 * @property {Socket} socket
 * @property {EncryptionSession} encryptionSession
 * @property {boolean} useEncryption
 * @property {boolean} inQueue
 */

/**
 * @typedef {object} TBufferWithConnection
 * @property {string} connectionId
 * @property {SocketWithConnectionInfo} connection
 * @property {Buffer} data
 * @property {number} timeStamp
 */
/**
 * @typedef {object} TransactionMessage
 * @property {function(): Buffer} serialize
 * @property {function(Buffer): void} deserialize
 */
/**
 * @typedef {object} JSONResponseOfGameMessage
 * @property {number} msgNo
 * @property {number | null} opCode
 * @property {number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {"sent" | "received"} direction
 * @property {string | null} sessionKey
 * @property {string} rawBuffer
 */

/**
 * @typedef {object} GameMessage
 * @property {function(): Buffer} serialize
 * @property {function(Buffer): void} deserialize
 * @property {function(): JSONResponseOfGameMessage} toJSON
 * @property {function(): string} dumpPacket
 */

/**
 * @typedef {object} BinaryStructure
 * @property {function(): Buffer} serialize
 * @property {function(Buffer): void} deserialize
 */

/**
 * @typedef {"boolean" | "byte" | "binary" | "char" | "u16" | "u32"} FIELD_TYPE
 */

/**
 * @exports
 * @typedef {object} GameMessageHandler
 * @property {number} opCode
 * @property {string} name
 * @property {function(ServiceArgs): Promise<import("packages/shared/State.js").ServiceResponse>} handler
 */

/**
 * @typedef {object} GameMessageOpCode
 * @property {string} name
 * @property {number} value
 * @property {"Lobby" | "Login"} module
 */

/**
 * @typedef {object} BuiltinError
 * @property {number} code
 * @property {string} message
 */

/**
 * @typedef {object} PersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */

/**
 * @typedef {object} UserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */

/**
 * @typedef {object} WebJSONResponse
 * @property {number} code
 * @property {import("http").OutgoingHttpHeaders | import("http").OutgoingHttpHeader[] | undefined} headers
 * @property {{connectionId: string, remoteAddress: string, inQueue: boolean}[]} body
 */

/**
 * @interface
 * @param {object} args
 * @param {Socket} args.incomingSocket
 * @param {import("packages/login/src/NPSUserStatus.js").Configuration} args.config
 * @param {import("pino").Logger} args.log
 * @returns {void}
 */
export function NetworkConnectionHandler({ incomingSocket, config, log }) {
    throw new ServerError("Not implemented");
}

/**
 * @typedef {(req: IncomingMessage, res: ServerResponse, config: import("packages/login/src/NPSUserStatus.js").Configuration, log: import("pino").Logger) => void} WebConnectionHandler
 */

/**
 * @typedef {function({connectionId: string, error: ServerError, log?: import("pino").Logger}): void} TSocketErrorHandler
 */

/**
 * @typedef {function({connectionId: string, log?: import("pino").Logger}): void} TSocketEndHandler
 */

/**
 * @typedef {function({socket: Socket, processMessage?: MessageProcessor, data: Buffer, log: import("pino").Logger, config: import("packages/login/src/NPSUserStatus.js").Configuration, connection: ClientConnection, connectionRecord: SocketWithConnectionInfo}): void} SocketOnDataHandler
 */

/**
 * @typedef {function({data: Buffer, connectionRecord: SocketWithConnectionInfo, config: import("packages/login/src/NPSUserStatus.js").Configuration, log: import("pino").Logger, connection: ClientConnection, message: ClientMessage | ClientMessage}): Promise<void>} MessageProcessor
 */

/**
 * @typedef {function({incomingSocket: Socket, config: import("packages/login/src/NPSUserStatus.js").Configuration, log: import("pino").Logger}): void} ConnectionHandler
 */

/**
 * @typedef {object} RaceLobbyRecord
 * @property {number} lobbyId
 * @property {number} raceTypeId
 * @property {number} turfId
 * @property {string} riffName
 * @property {string} eTurfName
 */

/**
 * @typedef {object} TPersonaSetver
 * @property {function(Buffer): Promise<GameMessage>} createNewGameAccount - Create a new game persona record
 * @property {function(Buffer): Promise<GameMessage>} logoutGameUser - Log out a game persona
 * @property {function(Buffer): Promise<GameMessage>} validateLicencePlate - Handle a check token packet
 * @property {function(Buffer): Promise<GameMessage>} validatePersonaName - Validate a persona name
 * @property {function(Buffer): Promise<GameMessage>} getPersonaMaps - Handle a get persona maps packet
 * @property {function(number): Promise<PersonaRecord[]>} getPersonasByCustomerId - Lookup all personas owned by the customer id
 */

/**
 * @typedef {object} AuthenticationServer
 * @property {function(IncomingMessage, ServerResponse): ServerResponse} handleRequest
 */

/**
 * @typedef {object} IConnectionManager
 * @property {ClientConnection[]} connections
 * @property {function(string): ClientConnection | undefined} findConnectionByID
 * @property {function(Socket): ClientConnection | undefined} findConnectionBySocket
 * @property {function(string, number): ClientConnection | undefined} findConnectionByAddressAndPort
 * @property {function(ClientConnection): void} addConnection
 * @property {function(string): void} removeConnection
 * @property {function(Socket): void} removeConnectionBySocket
 * @property {function(number): void} removeConnectionsByAppID
 * @property {function(): ClientConnection[]} getAllConnections
 * @property {function(ClientConnection[]): string} formatConnectionsAsHTML
 * @property {function(ClientConnection[]): string} formatConnectionsAsJSON
 * @property {function(): ClientConnection[]} getQueue
 * @property {function(Socket): ClientConnection} newConnectionFromSocket
 * @property {function(string, number): void} updateConnectionStatus
 * @property {function(string, Socket): void} updateConnectionSocket
 * @property {function(string, EncryptionSession, boolean): void} updateConnectionEncryption
 */

/**
 * @typedef {object} GamePatchingServer
 * @property {function(IncomingMessage, ServerResponse): ServerResponse} handleRequest
 * @property {function(IncomingMessage, ServerResponse): ServerResponse} castanetResponse
 */

/**
 * @exports
 * @interface
 * @typedef {object} SubprocessThread
 * @property {string} name
 * @property {number} loopInterval
 * @property {NodeJS.Timeout | null} timer
 * @property {Gateway | undefined} parentThread
 * @property {import("pino").Logger} log
 * @property {function(): void} init
 * @property {function(): void} run
 * @property {function(): void} shutdown
 */

/**
 * @interface GatewayServer
 * @extends {SubprocessThread}
 */

/**
 * @function
 * @name GatewayServer#help
 * @returns {void}
 */

/**
 * @function
 * @name GatewayServer#start
 * @returns {void}
 */

/**
 * @function
 * @name GatewayServer#stop
 * @returns {void}
 */

/**
 * @function
 * @name GatewayServer#restart
 * @returns {void}
 */

/**
 * @function
 * @name GatewayServer#exit
 * @returns {void}
 */

/**
 * @typedef {object} AdminWebServer
 * @property {function(IncomingMessage): WebJSONResponse} handleRequest
 */

/**
 * @typedef {object} IEncryptionManager
 * @property {function(ClientConnection, SessionKeys): EncryptionSession} generateEncryptionPair
 * @property {function(ClientConnection): EncryptionSession | undefined} selectEncryptors
 * @property {function(ClientConnection, SessionKeys): EncryptionSession} createEncrypters
 */

/**
 * @typedef {object} ServiceArgs
 * @property {string} connectionId
 * @property {RawMessage} message
 * @property {import("pino").Logger} log
 */

/**
 * @typedef {(args: ServiceArgs) => Promise<import("packages/shared/State.js").ServiceResponse>} Service
 *
 */

/**
 * @typedef {object} KeypressEvent
 * @property {string} sequence
 * @property {string} name
 * @property {boolean} ctrl
 * @property {boolean} meta
 * @property {boolean} shift
 */
