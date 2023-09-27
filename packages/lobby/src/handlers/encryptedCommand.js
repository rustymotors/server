import { getServerLogger } from "../../../shared/log.js";
import {
    fetchStateFromDatabase,
    getEncryption,
    updateEncryption,
} from "../../../shared/State.js";
import { ServerError } from "../../../shared/errors/ServerError.js";
import { LegacyMessage, RawMessage } from "../../../shared/messageFactory.js";
import { UserInfo } from "../UserInfoMessage.js";
// eslint-disable-next-line no-unused-vars

/**
 * Array of supported command handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: RawMessage,
 * log: import("pino").Logger,
 * }) => Promise<{
 * connectionId: string,
 * messages: RawMessage[],
 * }>}[]}
 */
export const messageHandlers = [];

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @returns {Promise<{
 * connectionId: string,
 * message: LegacyMessage,
 * }>}
 */
async function encryptCmd({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}) {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === "undefined") {
        throw new ServerError(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
    }

    const result = encryption.commandEncryption.encrypt(message.data);

    updateEncryption(state, encryption).save();

    log.debug(`[ciphered Cmd: ${result.toString("hex")}`);

    message.data = result;

    return {
        connectionId,
        message,
    };
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @returns {Promise<{
 *  connectionId: string,
 * message: LegacyMessage,
 * }>}
 */
async function decryptCmd({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}) {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === "undefined") {
        throw new ServerError(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
    }

    const result = encryption.commandEncryption.decrypt(message.data);

    updateEncryption(state, encryption).save();

    log.debug(`[Deciphered Cmd: ${result.toString("hex")}`);

    message.data = result;

    return {
        connectionId,
        message,
    };
}

/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @return {Promise<{
 * connectionId: string,
 * message: LegacyMessage,
 * }>}}
 */
async function handleCommand({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}) {
    const incommingRequest = message;

    log.debug(`Received command: ${incommingRequest.toString()}`);

    // What is the command?
    const command = incommingRequest.data.readUInt16BE(0);

    log.debug(`Command: ${command}`);

    switch (command) {
        case 0x128: // 296 - NPS_GET_MINI_USER_LIST
            log.debug("NPS_GET_MINI_USER_LIST");
            return handleGetMiniUserList({
                connectionId,
                message,
                log,
            });
        case 0x30c: // 780 - NPS_SEND_MINI_RIFF_LIST
            return handleSendMiniRiffList({
                connectionId,
                message,
                log,
            });
        default:
            throw new ServerError(`Unknown command: ${command}`);
    }
}

/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
  * @returns {Promise<{
*  connectionId: string,
* messages: RawMessage[],
* }>}

 */
export async function handleEncryptedNPSCommand({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}) {
    const inboundMessage = new LegacyMessage();
    inboundMessage._doDeserialize(message.data);

    // Decipher
    const decipheredMessage = decryptCmd({
        connectionId,
        message: inboundMessage,
        log,
    });

    const response = handleCommand({
        connectionId,
        message: (await decipheredMessage).message,
        log,
    });

    // Encipher
    const encryptedResponse = encryptCmd({
        connectionId,
        message: (await response).message,
        log,
    });

    const outboundMessage = new RawMessage();
    outboundMessage.data = (await encryptedResponse).message._doSerialize();

    return {
        connectionId,
        messages: [outboundMessage],
    };
}

const channelRecordSize = 40;

const channels = [
    {
        id: 0,
        name: "Channel 1",
        population: 0,
    },
];

const userRecordSize = 100;
const user1 = new UserInfo();
user1.id = 1;
user1.name = "User 1";

const users = [user1];

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 */
function handleSendMiniRiffList({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}) {
    log.debug("Handling NPS_SEND_MINI_RIFF_LIST");
    log.debug(`Received command: ${message.toString()}`);

    const resultSize = 4 + channelRecordSize * channels.length;

    const packetContent = Buffer.alloc(resultSize);

    try {
        // Add the response code
        packetContent.writeUInt16BE(0x060e, 0);

        let offset = 4;

        // loop through the channels
        for (const channel of channels) {
            packetContent.writeUInt16BE(channel.id, offset + 32);
            packetContent.writeUInt16BE(channel.population, offset + 36);

            offset += channelRecordSize;
        }

        // Build the packet
        const packetResult = new LegacyMessage();
        packetResult._header.id = 0x1101;
        packetResult._header.length = resultSize;
        packetResult.data = packetContent;

        log.debug(`Sending response: ${packetResult.toString()}`);

        return {
            connectionId,
            message: packetResult,
        };
    } catch (error) {
        throw ServerError.fromUnknown(
            error,
            `Error handling NPS_SEND_MINI_RIFF_LIST: ${error.message}`,
        );
    }
}

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 */
function handleGetMiniUserList({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}) {
    log.debug("Handling NPS_GET_MINI_USER_LIST");
    log.debug(`Received command: ${message.toString()}`);

    const resultSize = 4 + userRecordSize * users.length;

    const packetContent = Buffer.alloc(resultSize);

    try {
        // Add the response code
        packetContent.writeUInt16BE(0x0229, 0);

        let offset = 4;

        // loop through the users
        for (const user of users) {
            packetContent.copy(user.serialize(), offset);

            offset += userRecordSize;
        }

        // Build the packet
        const packetResult = new LegacyMessage();
        packetResult._header.id = 0x1101;
        packetResult._header.length = resultSize;
        packetResult.data = packetContent;

        log.debug(`Sending response: ${packetResult.toString()}`);

        return {
            connectionId,
            message: packetResult,
        };
    } catch (error) {
        throw ServerError.fromUnknown(
            error,
            `Error handling NPS_MINI_USER_LIST: ${error.message}`,
        );
    }
}
