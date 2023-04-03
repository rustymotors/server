import {
    cipherBufferDES,
    decipherBufferDES,
} from "../../../mcos-gateway/src/encryption.js";
import { NPSMessage } from "../../../mcos-gateway/src/NPSMessage.js";
import log from "../../../../log.js";

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @return {import("../../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 * @param {import("../../../mcos-gateway/src/connections.js").SocketWithConnectionInfo} dataConnection
 * @param {Buffer} plaintextCommand
 */
function encryptCmd(dataConnection, plaintextCommand) {
    if (typeof dataConnection.encryptionSession === "undefined") {
        const errMessage = `Unable to locate encryption session for connection id ${dataConnection.id}`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    const result = cipherBufferDES(
        dataConnection.encryptionSession,
        plaintextCommand
    );
    log.info(`[ciphered Cmd: ${result.data.toString("hex")}`);
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
function decryptCmd(dataConnection, encryptedCommand) {
    if (typeof dataConnection.connection.encryptionSession === "undefined") {
        const errMessage = `Unable to locate encryption session for connection id ${dataConnection.connectionId}`;
        log.error(errMessage);
        throw new Error(errMessage);
    }
    const result = decipherBufferDES(
        dataConnection.connection.encryptionSession,
        encryptedCommand
    );
    log.info(`[Deciphered Cmd: ${result.data.toString("hex")}`);
    dataConnection.connection.encryptionSession = result.session;
    dataConnection.data = result.data;
    return dataConnection;
}

/**
 *
 *
 * @param {import("../../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {import("../../../mcos-gateway/src/sockets.js").MessageArrayWithConnection}
 */
function handleCommand(dataConnection) {
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

    log.info("Sending a dummy response of 0x229 - NPS_MINI_USER_LIST");

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
 * @return {Promise<import("../../../mcos-gateway/src/sockets.js").MessageArrayWithConnection>}
 */
export async function handleEncryptedNPSCommand(dataConnection) {
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
