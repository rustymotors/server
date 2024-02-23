import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import {
    GameMessage,
    SerializableData,
} from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { getAsHex, getLenString } from "../utils/pureGet.js";
import {
    EncryptionSession,
    getEncryptionSession,
    getUserSessionByConnectionId,
    newEncryptionSession,
    setEncryptionSession,
    setUserSession,
} from "../services/session.js";
import { log } from "../../../packages/shared/log.js";
import { lobbyCommandMap } from "./lobbyCommands.js";

export async function processEncryptedGameCommand(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    log.info(`Attempting to decrypt message: ${message.toString()}`);

    // Get the session
    const session = await getUserSessionByConnectionId(connectionId);

    // If the session doesn't exist, return
    if (!session) {
        log.error(`Session not found for connection ID ${connectionId}`);
        throw new Error(`Session not found for connection ID ${connectionId}`);
    }

    // Get the encryption session
    let encryptionSession: EncryptionSession | undefined =
        await getEncryptionSession(connectionId);

    // If the encryption session doesn't exist, attempt to create it
    if (typeof encryptionSession === "undefined") {
        try {
            // Create the encryption session
            const newSession = await newEncryptionSession({
                connectionId,
                customerId: session.customerId,
                sessionKey: session.sessionKey.substring(0, 16),
            });
            setEncryptionSession(newSession);
            encryptionSession = newSession;
        } catch (error) {
            log.error(`Error creating encryption session: ${error}`);
            throw new Error("Error creating encryption session");
        }

        // Log the encryption session
        log.info(`Created encryption session for ${session.customerId}`);
    }

    // Attempt to decrypt the message
    const decryptedbytes = encryptionSession.gameDecipher.update(
        message.getDataAsBuffer(),
    );

    // Log the decrypted bytes
    log.info(`Decrypted bytes: ${getAsHex(decryptedbytes)}`);

    // Set the decrypted bytes as a new message
    const decryptedMessage = new GameMessage(0);
    decryptedMessage.deserialize(decryptedbytes);

    // Log the decrypted message id
    log.info(`Decrypted message ID: ${decryptedMessage.header.getId()}`);

    // Do we have a valid message processor?
    const processor = lobbyCommandMap.get(decryptedMessage.header.getId());

    if (typeof processor === "undefined") {
        log.error(
            `No processor found for message ID: ${decryptedMessage.header.getId()}`,
        );
        throw new Error(
            `No processor found for message ID: ${decryptedMessage.header.getId()}`,
        );
    }

    // Process the message
    let response = await processor(
        decryptedMessage.header.getId(),
        decryptedMessage.getDataAsBuffer(),
    );

    // Log the response
    log.info(`Response: ${response.length} bytes, ${getAsHex(response)}`);

    // Encrypt the response
    const encryptedResponse = encryptionSession.gameCipher.update(response);
    setEncryptionSession(encryptionSession);

    // Log the encrypted response
    log.info(
        `Encrypted response: ${encryptedResponse.length} bytes, ${getAsHex(
            encryptedResponse,
        )}`,
    );

    const responsePacket = new GameMessage(0);
    responsePacket.header.setId(0x1101);

    const responseData = new SerializableData(encryptedResponse.length);
    responseData.deserialize(encryptedResponse);

    responsePacket.setData(responseData);
    log.info(
        `Response packet: ${responsePacket.header.getLength()} bytes, ${getAsHex(
            responsePacket.serialize(),
        )}`,
    );
    const responseBytes = responsePacket.serialize();

    socketCallback([responseBytes]);
}
