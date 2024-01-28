import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { getAsHex, getLenString } from "../utils/pureGet.js";
import { EncryptionSession, getEncryptionSession, getUserSessionByConnectionId, newEncryptionSession, setEncryptionSession, setUserSession } from "../services/session.js";

export function processEncryptedGameCommand(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): void {


    console.log(`Attempting to decrypt message: ${message.toString()}`);

    // Get the session
    const session = getUserSessionByConnectionId(connectionId);

    // If the session doesn't exist, return
    if (!session) {
        throw new Error(`Session not found for connection ID ${connectionId}`);
    }

    // Get the encryption session
    let encryptionSession: EncryptionSession | undefined =
     getEncryptionSession(connectionId);

    // If the encryption session doesn't exist, attempt to create it
    if (typeof encryptionSession === "undefined") {
        try {
            // Create the encryption session
            const newSession = newEncryptionSession({
                connectionId,
                customerId: session.customerId,
                sessionKey: session.sessionKey.substring(0, 16),
            });
            setEncryptionSession(newSession);
            encryptionSession = newSession;
            } catch (error) {
                console.log(error);
            }

            // Log the encryption session
            console.log(`Created encryption session for ${session.customerId}`)    
    }

    // Attempt to decrypt the message
    try {
        // Decrypt the message
        // @ts-ignore - We know this is defined
        const decryptedbytes = encryptionSession.gameDecipher.update(
            message.getDataAsBuffer(),
        )

        // Log the decrypted bytes
        console.log(`Decrypted bytes: ${getAsHex(decryptedbytes)}`);

        // Set the decrypted bytes as a new message
        const decryptedMessage = new GameMessage(0);
        decryptedMessage.deserialize(decryptedbytes);

        // Log the message
        console.log(`EncryptedGameCommand: ${decryptedMessage.toString()}`);

    } catch (error) {
        console.log(error);
    }


    const response = new GameMessage(0);
    response.header.setId(0x207);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
}
