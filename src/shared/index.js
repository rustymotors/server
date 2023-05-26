export { Sentry } from "./sentry.js";
export { BinaryStructure } from "./BinaryStructure.js";
export { NPSMessage } from "./NPSMessage.js";
export { TSMessageBase } from "./TMessageBase.js";
export { getServerLogger } from "./logger.js";
export { setServerConfiguration } from "./ServerConfiguration.js";
export { MessageNode } from "./MessageNode.js";
/**
 * @module mcos-shared
 * @description Shared types and functions
 */

/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export function toHex(data) {
    /** @type {string[]} */
    const bytes = [];
    data.forEach((b) => {
        bytes.push(b.toString(16).toUpperCase().padStart(2, "0"));
    });
    return bytes.join("");
}

/**
 * @typedef {object} TNPS_COMMAND_MAP
 * @property {string} name
 * @property {number} value
 * @property {"Lobby" | "Login"} module
 */

/**
 * @typedef {object} SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */



/**
 * @typedef {object} TJSONResponse
 * @property {number} code
 * @property {OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined} headers
 * @property {string} body
 */    

/**
 * @exports mcos-shared.TSocketWithConnectionInfo
 * @typedef {object} TSocketWithConnectionInfo
 * @property {Socket} socket
 * @property {number} seq
 * @property {string} id
 * @property {string} remoteAddress
 * @property {number} localPort
 * @property {number} personaId
 * @property {number} lastMessageTimestamp
 * @property {boolean} inQueue
 * @property {TEncryptionSession} [encryptionSession]
 * @property {boolean} useEncryption
 */

/**
 * @typedef {object} TMessageArrayWithConnection
 * @property {TSocketWithConnectionInfo} connection
 * @property {TSMessageBase[] | TMessageNode[] | TNPSMessage[]} messages
 * @property {TServerLogger} log 
 */

/**
 * @typedef {TMessageArrayWithConnection} TServiceResponse
 */    

    /**
     * @exports mcos/shared.TBufferWithConnection
     * @typedef {object} TBufferWithConnection
     * @property {string} connectionId
     * @property {TSocketWithConnectionInfo} connection
     * @property {Buffer} data
     * @property {number} timeStamp
     */
    

    /**
 * @typedef {Function} HandlerFunctionType
 * @description The handler function for a message
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @returns {Promise<TMessageArrayWithConnection>}
 */

    /**
     * @typedef {object} TMessageHandler
     * @property {number} opCode
     * @property {string} name
     * @property {HandlerFunctionType} handlerFunction
     */

    /**
     * @typedef {object} TConnection
     * @property {string} id
     * @property {number} localPort
     * @property {string} remoteAddress
     * @property {Socket} socket
     * @property {TEncryptionSession} encryptionSession
     * @property {boolean} useEncryption
     * @property {boolean} inQueue
     */
    
    /**
     * @typedef {"debug" | "info" | "notice" | "warning" | "err" | "crit" | "alert" | "emerg"} ELOG_LEVEL
     * @readonly
     * @description The log levels
     */

/**
 * @exports mcos-shared.TServerConfiguration
 * @typedef {object} TServerConfiguration
 * @property {string} EXTERNAL_HOST
 * @property {string} certificateFileContents
 * @property {string} privateKeyContents
 * @property {string} publicKeyContents
 * @property {ELOG_LEVEL} LOG_LEVEL
 */
    
/**
 * @exports mcos-shared.TServerLogger
 * @typedef {Function} TServerLogger
 * @param {ELOG_LEVEL} level
 * @param {string} msg
 * @returns {void}
 */

/**
 * @typedef {Function} UpdateSessionKeyFunction
 * @param {number} customerId
 * @param {string} sessionkey
 * @param {string} contextId
 * @param {string} connectionId
 * @returns {Promise<void>}
 */

/**
 * @typedef {Function} fetchSessionKeyByCustomerIdFunction
 * @param {number} customerId
 * @returns {Promise<TSessionRecord>}
 */

/**
 * @exports mcos-shared.TDatabaseManager
 * @typedef {object} TDatabaseManager
 * @property {UpdateSessionKeyFunction} updateSessionKey
 * @property {fetchSessionKeyByCustomerIdFunction} fetchSessionKeyByCustomerId
 */

/**
 * @exports mcos-shared.TSession
 * @typedef {object} TSession
 * @property {number} customerId
 * @property {string} connectionId
 * @property {string} sessionKey
 * @property {string} sKey
 * @property {string} contextId
 */

/**
 * @exports mcos-shared.TSessionRecord
 * @typedef {object} TSessionRecord
 * @property {string} sessionKey
 * @property {string} sKey
 */

/**
 * @typedef {Function} SerializeFunction
 * @returns {Buffer}
 */

/**
 * @exports mcos-shared.TSerializeFunction
 * @typedef {Function} DeserializeFunction
 * @param {Buffer} inputBuffer
 * @returns {void}
 */

/**
 * @exports mcos-shared.TBinaryStructure
 * @typedef {object} TBinaryStructure
 * @property {SerializeFunction} serialize
 * @property {DeserializeFunction} deserialize
 */

/**
 * @exports mcos-shared.TMessageNode
 * @typedef {object} TMessageNode
 * @property {SerializeFunction} serialize
 * @property {DeserializeFunction} deserialize
 */

/**
 * @typedef {Function} ToJSONFunction
 * @returns {TNPSMessageJSON}
 */

/**
 * @typedef {Function} DumpPacketFunction
 * @returns {string}
 */

/**
 * @exports mcos-shared.TNPSMessage
 * @typedef {object} TNPSMessage
 * @property {SerializeFunction} serialize
 * @property {DeserializeFunction} deserialize
 * @property {ToJSONFunction} toJSON
 * @property {DumpPacketFunction} dumpPacket
 */


/**
 * @exports mcos-shared.FIELD_TYPE
 * @typedef {"boolean" | "byte" | "binary" | "char" | "u16" | "u32"} FIELD_TYPE
 */

/**
 * @typedef {object} TEncryptionSession
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
 * @exports mcos-shared.TNPSMessageJSON
 * @typedef {object} TNPSMessageJSON
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
 * @exports mcos-shared.TPersonaRecord
 * @typedef {object} TPersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */

/**
 * @exports mcos-shared.TUserRecordMini
 * @typedef {object} TUserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */



