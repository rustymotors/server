import { NPSMessage } from "../../../shared/NPSMessage.js";
import { getServerLogger } from "../../../shared/log.js";
import {
    fetchStateFromDatabase,
    getEncryption,
    updateEncryption,
} from "../../../shared/State.js";
import { ServerError } from "../../../shared/errors/ServerError.js";
// eslint-disable-next-line no-unused-vars
import { RawMessage } from "../../../shared/RawMessage.js";

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {NPSMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @returns {Promise<{
 * connectionId: string,
 * message: NPSMessage,
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
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @returns {Promise<{
 *  connectionId: string,
 * message: RawMessage,
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
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @return {Promise<{
 * connectionId: string,
 * message: NPSMessage,
 * }>}}
 */
async function handleCommand({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}) {
    // Marshal the command into an NPS packet
    const incommingRequest = new NPSMessage();
    incommingRequest.deserialize(message.serialize());

    log.debug(`Received command: ${incommingRequest.toString()}`);

    // Create the packet content
    const packetContent = Buffer.alloc(375);

    // Add the response code
    packetContent.writeUInt16BE(0x0219, 367);
    packetContent.writeUInt16BE(0x0101, 369);
    packetContent.writeUInt16BE(0x022c, 371);

    log.debug("Sending a dummy response of 0x229 - NPS_MINI_USER_LIST");

    // Build the packet
    const packetResult = new NPSMessage();
    packetResult.msgNo = 0x229;
    packetResult.setContent(packetContent);

    log.debug(`Sending response: ${packetResult.toString()}`);

    return {
        connectionId,
        message: packetResult,
    };
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
    // Decipher
    const decipheredMessage = decryptCmd({
        connectionId,
        message,
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

    const outboundMessage = RawMessage.fromNPSMessage(
        (await encryptedResponse).message,
    );

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
