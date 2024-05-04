import { type TServerLogger } from "../../shared";
import {
    MessageProcessorError,
    getGameMessageProcessor, GameMessage as OldGameMessage
} from "../../nps/index.js";
import type { SocketCallback } from "../../nps/messageProcessors/index.js";
import { GameMessage } from "../../shared-packets";
import type { Socket } from "node:net";


export function sendToGameSocket(
    serializedMessages: Buffer[],
    incomingSocket: Socket,
    log: TServerLogger,
) {
    log.setName("gateway:sendToGameSocket");
    log.debug(`Sending {${serializedMessages.length}} messages to game socket on port ${incomingSocket.localPort}`);
    try {
        serializedMessages.forEach((m) => {
            incomingSocket.write(m);
            log.trace(`Sent ${m.length} bytes to socket: ${m.toString("hex")}`);
            log.trace("===========================================");
        });
        log.resetName();
    } catch (error) {
        log.error(`Error sending game data: ${String(error)}`);
        log.resetName();
        throw error;
    }
}


export function processGameMessage(
    connectionId: string,
    message: OldGameMessage,
    log: TServerLogger,
    socketCallback: SocketCallback
) {
    log.setName("gateway:processGameMessage");
    log.debug(`Processing game message...`);

    // Get the message ID
    const messageId = message.header.getId();

    // Get the message processor
    const messageProcessor = getGameMessageProcessor(messageId);

    // If there is no message processor, throw an error
    if (messageProcessor === undefined) {
        log.error(`No message processor for message ID: ${messageId}`);
        throw new MessageProcessorError(
            messageId,
            `No message processor for message ID: ${messageId}`
        );
    }

    // Call the message processor
    log.debug(`Processing message ID: ${messageId} with processor: ${messageProcessor.name}`);
    messageProcessor(connectionId, message, socketCallback).catch((error) => {
        log.error(`Error processing message: ${(error as Error).message}`);
        throw new MessageProcessorError(
            messageId,
            `Error processing message: ${(error as Error).message}`
        );
    });
}

export function handleGameMessage(
    connectionId: string,
    bytes: Buffer,
    log: TServerLogger,
    socketCallback: SocketCallback
) {
    log.setName("gateway:handleGameMessage");
    log.debug(`Handling game message...`);

    // Log raw bytes
    log.trace(`Raw bytes: ${bytes.toString("hex")}`);

    // Since a GameMessage v1 header is 12 byes long, a message smaller that that can only be v0
    const msgVersion = bytes.byteLength <= 12 ? 0 : 1;

    // Load new game message
    const gameMessage = new GameMessage(msgVersion).deserialize(bytes);

    log.debug(`Game message: ${gameMessage.toString()}`);

    // Try to identify the message version
    const version = OldGameMessage.identifyVersion(bytes);

    // Log the version
    log.debug(`Message version: ${version}`);

    // Try to parse it
    try {
        // Create a new message
        const message = new OldGameMessage(version);
        message.deserialize(bytes);

        // Process the message
        void processGameMessage(connectionId, message, log, socketCallback);
    } catch (error) {
        const err = `Error processing game message: ${(error as Error).message}`;
        log.fatal(err);
        throw Error(err);
    }
}

// Path: packages/gateway/src/handleGameMessage.ts
