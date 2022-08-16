import type { Connection } from "@prisma/client";
import { logger } from "mcos-logger/src/index.js";
import {
    cipherBufferDES,
    createEncryptors,
    decipherBufferDES,
} from "../encryption.js";
import { NPSMessage } from "../NPSMessage.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcos:lobby" });

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @param {Connection} connection
 * @param {Buffer} plaintextCommand
 * @return {NPSMessage}
 */
async function encryptCmd(
    connection: Connection,
    plaintextCommand: Buffer
): Promise<NPSMessage> {
    const keys = await prisma.session.findUnique({
        where: {
            customerId: connection.customerId,
        },
    });

    if (keys === null) {
        throw new Error("Error fetching session keys in encryptCmd");
    }

    const encryptionSession = createEncryptors(connection.id, keys);

    const result = cipherBufferDES(encryptionSession, plaintextCommand);
    log.debug(`[ciphered Cmd: ${result.data.toString("hex")}`);
    return new NPSMessage("sent").deserialize(result.data);
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @return {IBufferWithConnection}
 * @param {IBufferWithConnection} dataConnection
 * @param {Buffer} encryptedCommand
 */
async function decryptCmd(
    connection: Connection,
    encryptedCommand: Buffer
): Promise<Buffer> {
    const keys = await prisma.session.findUnique({
        where: {
            customerId: connection.customerId,
        },
    });

    if (keys === null) {
        throw new Error("Error fetching session keys in decryptCmd");
    }

    const encryptionSession = createEncryptors(connection.id, keys);

    const decryptedData = decipherBufferDES(
        encryptionSession,
        encryptedCommand
    );
    log.debug(`[Deciphered Cmd: ${decryptedData.toString("hex")}`);
    return decryptedData;
}

/**
 *
 *
 * @param {Connection} _connection
 * @param {Buffer} data
 * @return {NPSMessage}
 */
function handleCommand(_connection: Connection, data: Buffer): NPSMessage {
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

    return packetResult;
}

/**
 *
 *
 * @param {Connection} connection
 * @param {Buffer} data
 * @return {NPSMessage}
 */
export async function handleEncryptedNPSCommand(
    traceId: string,
    connection: Connection,
    data: Buffer
): Promise<NPSMessage> {
    log.raw({
        level: "debug",
        message: "Received encrypted command",
        otherKeys: {
            function: "handleEncryptedNPSCommand",
            connectionId: connection.id,
            traceId,
        },
    });
    // Decipher
    const decipheredBuffer = await decryptCmd(
        connection,
        Buffer.from(data.subarray(4))
    );

    const responsePacket = handleCommand(connection, decipheredBuffer);

    // Encipher
    const encryptedPacket = encryptCmd(connection, responsePacket.serialize());

    return encryptedPacket;
}
