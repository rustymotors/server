import { logger } from "mcos-logger/src/index.js";
import type {
    BufferWithConnection,
    GSMessageArrayWithConnection,
    SocketWithConnectionInfo,
} from "mcos-types/types.js";
import { cipherBufferDES, decipherBufferDES } from "../encryption.js";
import { NPSMessage } from "../NPSMessage.js";

const log = logger.child({ service: "mcos:lobby" });

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @return {IGSMessageArrayWithConnection}
 * @param {ISocketWithConnectionInfo} dataConnection
 * @param {Buffer} plaintextCommand
 */
function encryptCmd(
    dataConnection: SocketWithConnectionInfo,
    plaintextCommand: Buffer
): GSMessageArrayWithConnection {
    if (typeof dataConnection.encryptionSession === "undefined") {
        const errMessage = `Unable to locate encryption session for connection id ${dataConnection.id}`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    const result = cipherBufferDES(
        dataConnection.encryptionSession,
        plaintextCommand
    );
    log.debug(`[ciphered Cmd: ${result.data.toString("hex")}`);
    dataConnection.encryptionSession = result.session;
    return {
        connection: dataConnection,
        messages: [new NPSMessage("sent").deserialize(result.data)],
    };
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @return {IBufferWithConnection}
 * @param {IBufferWithConnection} dataConnection
 * @param {Buffer} encryptedCommand
 */
function decryptCmd(
    dataConnection: BufferWithConnection,
    encryptedCommand: Buffer
): BufferWithConnection {
    if (typeof dataConnection.connection.encryptionSession === "undefined") {
        const errMessage = `Unable to locate encryption session for connection id ${dataConnection.connectionId}`;
        log.error(errMessage);
        throw new Error(errMessage);
    }
    const result = decipherBufferDES(
        dataConnection.connection.encryptionSession,
        encryptedCommand
    );
    log.debug(`[Deciphered Cmd: ${result.data.toString("hex")}`);
    dataConnection.connection.encryptionSession = result.session;
    dataConnection.data = result.data;
    return dataConnection;
}

/**
 *
 *
 * @param {IBufferWithConnection} dataConnection
 * @return {IGSMessageArrayWithConnection}
 */
function handleCommand(
    dataConnection: BufferWithConnection
): GSMessageArrayWithConnection {
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

    log.debug("Sending a dummy response of 0x229 - NPS_MINI_USER_LIST");

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
 * @param {IBufferWithConnection} dataConnection
 * @return {IGSMessageArrayWithConnection}
 */
export async function handleEncryptedNPSCommand(
    dataConnection: BufferWithConnection
): Promise<GSMessageArrayWithConnection> {
    // Decipher
    const { data } = dataConnection;
    const decipheredConnection = decryptCmd(
        dataConnection,
        Buffer.from(data.slice(4))
    );

    const responseConnection = handleCommand(decipheredConnection);

    // Encipher
    responseConnection.messages.forEach((m) => {
        encryptCmd(responseConnection.connection, m.serialize());
    });

    return responseConnection;
}
