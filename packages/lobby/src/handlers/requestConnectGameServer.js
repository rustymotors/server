import { _generateSessionKeyBuffer } from "../sessionKeys.js";
import { NPSMessage } from "../../../shared/NPSMessage.js";
import { getServerLogger } from "../../../shared/log.js";
import { MessagePacket } from "../MessagePacket.js";
import { getPersonasByPersonaId } from "../../../persona/src/internal.js";
import { getDatabaseServer } from "../../../database/src/DatabaseManager.js";
import { LoginInfoMessage } from "../LoginInfoMessage.js";
import { RawMessage } from "../../../shared/RawMessage.js";

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
 * Handle a request to connect to a game server packet
 *
 * @private
 * @param {import("../../../interfaces/index.js").ServiceArgs} args
 * @returns {Promise<{
 *  connectionId: string,
 * messages: RawMessage[],
 * }>}
 */
export async function _npsRequestGameConnectServer({
    connectionId,
    message,
    log = getServerLogger({
        module: "LoginServer",
    }),
}) {
    // This is a NPS_LoginInfo packet
    // As a legacy packet, it used the old NPSMessage format
    // of a 4 byte header, followed by a 4 byte length, followed
    // by the data payload.

    const inboundMessage = new LoginInfoMessage();
    inboundMessage.deserialize(message.raw);

    log.debug(`LoginInfoMessage: ${inboundMessage.asJson()}`);

    const personas = await getPersonasByPersonaId(inboundMessage._userId);
    if (typeof personas[0] === "undefined") {
        const err = new Error("No personas found.");
        throw err;
    }

    const { customerId } = personas[0];

    // Set the encryption keys on the lobby connection
    const databaseManager = getDatabaseServer({ log });
    const keys = await databaseManager
        .fetchSessionKeyByCustomerId(customerId)
        .catch((/** @type {unknown} */ error) => {
            throw new Error(
                `Unable to fetch session key for customerId ${customerId.toString()}: ${String(
                    error,
                )}`,
            );
        });
    if (keys === undefined) {
        throw new Error("Error fetching session keys!");
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
    const packetResult = new NPSMessage();
    packetResult.msgNo = 0x120;
    packetResult.setContent(packetContent);

    const loginResponsePacket = MessagePacket.fromBuffer(
        packetResult.serialize(),
    );

    log.debug(
        `!!! outbound lobby login response packet: ${loginResponsePacket
            .getBuffer()
            .toString("hex")}`,
    );

    const outboundMessage = RawMessage.fromNPSMessage(packetResult);

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
