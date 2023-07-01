import { cipherBufferDES, decipherBufferDES } from "mcos/gateway";
import { NPSMessage, Sentry } from "mcos/shared";
import {
    TSocketWithConnectionInfo,
    TServerLogger,
    TMessageArrayWithConnection,
    TBufferWithConnection,
    TServiceResponse,
    TServiceRouterArgs,
} from "mcos/shared/interfaces";

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @return {TMessageArrayWithConnection}
 * @param {TSocketWithConnectionInfo} dataConnection
 * @param {TServerLogger} log
 * @param {Buffer} plaintextCommand
 */
function encryptCmd(
    dataConnection: TSocketWithConnectionInfo,
    plaintextCommand: Buffer,
    log: TServerLogger
): TMessageArrayWithConnection {
    if (typeof dataConnection.encryptionSession === "undefined") {
        const err = new Error(
            `Unable to locate encryption session for connection id ${dataConnection.id}`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
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
 * @return {TBufferWithConnection}
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @param {Buffer} encryptedCommand
 */
function decryptCmd(
    dataConnection: TBufferWithConnection,
    encryptedCommand: Buffer,
    log: TServerLogger
): TBufferWithConnection {
    if (typeof dataConnection.connection.encryptionSession === "undefined") {
        const err = new Error(
            `Unable to locate encryption session for connection id ${dataConnection.connectionId}`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
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
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return TMessageArrayWithConnection}
 */
function handleCommand(
    dataConnection: TBufferWithConnection,
    log: TServerLogger
): TMessageArrayWithConnection {
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
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 */
export async function handleEncryptedNPSCommand(
    args: TServiceRouterArgs
): Promise<TServiceResponse> {
    // Decipher
    const { legacyConnection: dataConnection, config, log } = args;
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
