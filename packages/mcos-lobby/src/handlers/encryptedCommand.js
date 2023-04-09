import {
    cipherBufferDES,
    decipherBufferDES,
} from "../../../mcos-gateway/src/encryption.js";
import { NPSMessage } from "../../../mcos-gateway/src/NPSMessage.js";

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @return {import("mcos/shared").TMessageArrayWithConnection}
 * @param {import("mcos/shared").TSocketWithConnectionInfo} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @param {Buffer} plaintextCommand
 */
function encryptCmd(dataConnection, plaintextCommand, log) {
    if (typeof dataConnection.encryptionSession === "undefined") {
        const errMessage = `Unable to locate encryption session for connection id ${dataConnection.id}`;
        throw new Error(errMessage);
    }

    const result = cipherBufferDES(
        dataConnection.encryptionSession,
        plaintextCommand
    );
    log("debug", `[ciphered Cmd: ${result.data.toString("hex")}`);
    dataConnection.encryptionSession = result.session;
    return {
        connection: dataConnection,
        messages: [new NPSMessage("sent").deserialize(result.data)],
        log,
    };
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @return {import("mcos/shared").TBufferWithConnection}
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @param {Buffer} encryptedCommand
 */
function decryptCmd(dataConnection, encryptedCommand, log) {
    if (typeof dataConnection.connection.encryptionSession === "undefined") {
        const errMessage = `Unable to locate encryption session for connection id ${dataConnection.connectionId}`;
        throw new Error(errMessage);
    }
    const result = decipherBufferDES(
        dataConnection.connection.encryptionSession,
        encryptedCommand
    );
    log("debug", `[Deciphered Cmd: ${result.data.toString("hex")}`);
    dataConnection.connection.encryptionSession = result.session;
    dataConnection.data = result.data;
    return dataConnection;
}

/**
 *
 *
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @return {import("mcos/shared").TMessageArrayWithConnection}
 */
function handleCommand(dataConnection, log) {
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

    log("debug", "Sending a dummy response of 0x229 - NPS_MINI_USER_LIST");

    // Build the packet
    const packetResult = new NPSMessage("sent");
    packetResult.msgNo = 0x2_29;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();

    return {
        connection: dataConnection.connection,
        messages: [packetResult],
        log,
    };
}

/**
 *
 *
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<import("mcos/shared").TMessageArrayWithConnection>}
 */
export async function handleEncryptedNPSCommand(dataConnection, log) {
    // Decipher
    const { data } = dataConnection;
    const decipheredConnection = decryptCmd(
        dataConnection,
        Buffer.from(data.subarray(4)),
        log
    );

    const responseConnection = handleCommand(decipheredConnection, log);

    // Encipher
    responseConnection.messages.forEach((m) => {
        encryptCmd(responseConnection.connection, m.serialize(), log);
    });

    return responseConnection;
}
