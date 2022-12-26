import { cipherBufferDES, decipherBufferDES } from "../../../mcos-gateway/src/encryption.js";
import createDebug from 'debug'
import { createLogger } from 'bunyan'
import { NPSMessage } from "../../../mcos-gateway/src/NPSMessage.js";

const appName = 'mcos'

const debug = createDebug(appName)
const log = createLogger({ name: appName })



/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @return {import("../../../mcos-gateway/src/sockets.js").GSMessageArrayWithConnection}
 * @param {import("../../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} dataConnection
 * @param {Buffer} plaintextCommand
 */
function encryptCmd(
    dataConnection,
    plaintextCommand
) {
    if (typeof dataConnection.encryptionSession === "undefined") {
        const errMessage = `Unable to locate encryption session for connection id ${dataConnection.id}`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    const result = cipherBufferDES(
        dataConnection.encryptionSession,
        plaintextCommand
    );
    debug(`[ciphered Cmd: ${result.data.toString("hex")}`);
    dataConnection.encryptionSession = result.session;
    return {
        connection: dataConnection,
        messages: [new NPSMessage("sent").deserialize(result.data)],
    };
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @return {import("../../../mcos-gateway/src/sockets.js").BufferWithConnection}
 * @param {import("../../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @param {Buffer} encryptedCommand
 */
function decryptCmd(
    dataConnection,
    encryptedCommand
) {
    if (typeof dataConnection.connection.encryptionSession === "undefined") {
        const errMessage = `Unable to locate encryption session for connection id ${dataConnection.connectionId}`;
        log.error(errMessage);
        throw new Error(errMessage);
    }
    const result = decipherBufferDES(
        dataConnection.connection.encryptionSession,
        encryptedCommand
    );
    debug(`[Deciphered Cmd: ${result.data.toString("hex")}`);
    dataConnection.connection.encryptionSession = result.session;
    dataConnection.data = result.data;
    return dataConnection;
}

/**
 *
 *
 * @param {import("../../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {import("../../../mcos-gateway/src/sockets.js").GSMessageArrayWithConnection}
 */
function handleCommand(
    dataConnection
) {
    const { data } = dataConnection;

    // Marshal the command into an NPS packet
    const incommingRequest = new NPSMessage("received");
    incommingRequest.deserialize(data);

    incommingRequest.dumpPacket();

    // Create the packet content
    const packetContent = Buffer.alloc(375);

    // Add the response code
    packetContent.writeUInt16BE(0x02_19, 367);
    packetContent.writeUInt16BE(0x01_01, 369);
    packetContent.writeUInt16BE(0x02_2c, 371);

    debug("Sending a dummy response of 0x229 - NPS_MINI_USER_LIST");

    // Build the packet
    const packetResult = new NPSMessage("sent");
    packetResult.msgNo = 0x2_29;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();

    return {
        connection: dataConnection.connection,
        messages: [packetResult],
    };
}

/**
 *
 *
 * @param {import("../../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {Promise<import("../../../mcos-gateway/src/sockets.js").GSMessageArrayWithConnection>}
 */
export async function handleEncryptedNPSCommand(
    dataConnection
) {
    // Decipher
    const { data } = dataConnection;
    const decipheredConnection = decryptCmd(
        dataConnection,
        Buffer.from(data.subarray(4))
    );

    const responseConnection = handleCommand(decipheredConnection);

    // Encipher
    responseConnection.messages.forEach((m) => {
        encryptCmd(responseConnection.connection, m.serialize());
    });

    return responseConnection;
}
