import { GenericReply } from "./GenericReplyMessage.js";
import { TClientConnectMessage } from "./TClientConnectMessage.js";
import { getDatabaseServer } from "../../database/src/DatabaseManager.js";
import { ServerError } from "../../shared/errors/ServerError.js";
import {
    McosEncryption,
    addEncryption,
    fetchStateFromDatabase,
    getEncryption,
} from "../../shared/State.js";
import {
    createCommandEncryptionPair,
    createDataEncryptionPair,
} from "../../gateway/src/encryption.js";
import { ServerMessage } from "../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function clientConnect({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    const newMessage = new TClientConnectMessage();

    newMessage.deserialize(packet.serialize());

    log.debug(`ClientConnectMsg: ${newMessage.toString()}`);

    const customerId = newMessage._customerId;
    if (typeof customerId !== "number") {
        throw new TypeError(
            `customerId is wrong type. Expected 'number', got ${typeof customerId}`,
        );
    }

    const state = fetchStateFromDatabase();

    const existingEncryption = getEncryption(state, connectionId);

    if (existingEncryption) {
        log.debug("Encryption already exists for this connection");
        return { connectionId, messages: [] };
    }

    let result;

    log.debug(`Looking up the session key for ${customerId}...`);

    result = await getDatabaseServer({
        log,
    }).fetchSessionKeyByCustomerId(customerId);
    log.debug(`Session key found for ${customerId}`);

    const newCommandEncryptionPair = createCommandEncryptionPair(
        result.sessionKey,
    );

    const newDataEncryptionPair = createDataEncryptionPair(result.sessionKey);

    const newEncryption = new McosEncryption({
        connectionId,
        commandEncryptionPair: newCommandEncryptionPair,
        dataEncryptionPair: newDataEncryptionPair,
    });

    addEncryption(state, newEncryption).save();

    const personaId = newMessage._personaId;

    const personaName = newMessage._personaName;

    log.debug(`cust: ${customerId} ID: ${personaId} Name: ${personaName}`);

    // Create new response packet
    const pReply = new GenericReply();
    pReply.msgNo = 101;
    pReply.msgReply = newMessage._msgNo;

    const responsePacket = new ServerMessage();
    responsePacket.setBuffer(pReply.serialize());
    responsePacket._header.sequence = packet._header.sequence;

    log.debug(`Response: ${responsePacket.serialize().toString("hex")}`);

    return { connectionId, messages: [responsePacket] };
}
