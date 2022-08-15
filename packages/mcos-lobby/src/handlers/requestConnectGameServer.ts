import { getPersonasByPersonaId } from "../../../mcos-persona/src/index.js";
import { logger } from "mcos-logger/src/index.js";
import { NPSUserInfo } from "../NPSUserInfo.js";
import { NPSMessage } from "../NPSMessage.js";
import { MessagePacket } from "../MessagePacket.js";
import type { Connection } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcos:lobby" });

/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export function toHex(data: Buffer): string {
    /** @type {string[]} */
    const bytes: string[] = [];
    data.forEach((b) => {
        bytes.push(b.toString(16).toUpperCase().padStart(2, "0"));
    });
    return bytes.join("");
}

/**
 * @param {string} key
 * @return {Buffer}
 */
export function _generateSessionKeyBuffer(key: string): Buffer {
    const nameBuffer = Buffer.alloc(64);
    Buffer.from(key, "utf8").copy(nameBuffer);
    return nameBuffer;
}

/**
 * Handle a request to connect to a game server packet
 *
 * @private
 * @param {Connection} connection
 * @param {Buffer} data
 * @return {Promise<NPSMessage>}
 */
export async function _npsRequestGameConnectServer(
    connection: Connection,
    data: Buffer
): Promise<NPSMessage> {
    log.trace(
        `[inner] Raw bytes in _npsRequestGameConnectServer: ${toHex(data)}`
    );

    log.debug(
        `_npsRequestGameConnectServer: ${JSON.stringify({
            remoteAddress: connection.remoteAddress,
            localPort: connection.localPort,
            data: data.toString("hex"),
        })}`
    );

    // since the data is a buffer at this point, let's place it in a message structure
    const inboundMessage = MessagePacket.fromBuffer(data);

    log.debug(`message buffer (${inboundMessage.getBuffer().toString("hex")})`);

    // Return a _NPS_UserInfo structure
    const userInfo = new NPSUserInfo("received");
    userInfo.deserialize(data);
    log.debug(userInfo.dumpInfo());

    const personas = await getPersonasByPersonaId(userInfo.userId);
    if (typeof personas[0] === "undefined") {
        throw new Error(
            `No personas found for userId: (${String(userInfo.userId)})`
        );
    }

    const { id: personaId } = personas[0];

    await prisma.connection
        .update({
            where: {
                id: connection.id,
            },
            data: {
                personaId: personaId.readInt32BE(0),
            },
        })
        .catch((error) => {
            throw new Error(
                `Error updating persona id on connection: ${String(error)}`
            );
        })
        .finally(() => {
            log.debug("Persona id updated");
        });

    // Set the encryption keys on the lobby connection
    const keys = await prisma.session.findFirst({
        where: {
            customerId: connection.customerId,
        },
    });

    if (keys === null) {
        throw new Error(
            "Error fetching session keys in _npsRequestGameConnectServer"
        );
    }

    const packetContent = Buffer.alloc(72);

    // This response is a NPS_UserStatus

    // Ban and Gag

    // NPS_USERID - User ID - persona id - long
    Buffer.from([0x00, 0x84, 0x5f, 0xed]).copy(packetContent);

    // SessionKeyStr (32)
    _generateSessionKeyBuffer(keys.sessionKey).copy(packetContent, 4);

    // SessionKeyLen - int
    packetContent.writeInt16BE(32, 66);

    // Build the packet
    const packetResult = new NPSMessage("sent");
    packetResult.msgNo = 0x1_20;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();

    const loginResponsePacket = MessagePacket.fromBuffer(
        packetResult.serialize()
    );

    log.debug(
        `!!! outbound lobby login response packet: ${loginResponsePacket
            .getBuffer()
            .toString("hex")}`
    );
    return packetResult;
}
