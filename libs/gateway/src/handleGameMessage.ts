import type { Socket } from "node:net";
import {
  GameMessage,
  GameSocketCallback,
  MessageProcessorError,
  GameMessage as OldGameMessage,
  UserStatus,
  getGameMessageProcessor,
} from "nps";
import { type TServerLogger } from "shared";

export function sendToGameSocket(
  serializedMessages: Buffer[],
  incomingSocket: Socket,
  log: TServerLogger
) {
  log.setName("gateway:sendToGameSocket");
  log.debug(
    `Sending {${serializedMessages.length}} messages to game socket on port ${incomingSocket.localPort}`
  );
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
  userStatus: UserStatus,
  message: OldGameMessage,
  log: TServerLogger,
  socketCallback: GameSocketCallback
) {
  log.setName("gateway:processGameMessage");

  // Get the message ID
  const messageId = message.header.getId();

  // Get the message processor
  const processor = getGameMessageProcessor(messageId);

  // If there is no message processor, throw an error
  if (processor === undefined) {
    log.error(`No message processor for message ID: ${messageId}`);
    throw new MessageProcessorError(
      messageId,
      `No message processor for message ID: ${messageId}`
    );
  }

  // Call the message processor
  log.setName("gateway:processGameMessage");
  log.debug(
    `Processing game message with message ID ${message.getId()}, using processor ${
      processor.name
    }`
  );
  processor(connectionId, userStatus, message, socketCallback).catch(
    (error: Error) => {
      log.error(`Error processing message: ${(error as Error).message}`);
      throw new MessageProcessorError(
        messageId,
        `Error processing message: ${(error as Error).message}`
      );
    }
  );
}

export function handleGameMessage(
  connectionId: string,
  userStatus: UserStatus,
  bytes: Buffer,
  log: TServerLogger,
  socketCallback: GameSocketCallback
) {
  log.setName("gateway:handleGameMessage");
  log.debug(`Handling game message...`);

  // Log raw bytes
  log.trace(`Raw bytes: ${bytes.toString("hex")}`);

  // Since a GameMessage v1 header is 12 byes long, a message smaller that that can only be v0
  const msgVersion = bytes.byteLength <= 12 ? 0 : 257;

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
    void processGameMessage(
      connectionId,
      userStatus,
      message,
      log,
      socketCallback
    );
  } catch (error) {
    const err = `Error processing game message: ${(error as Error).message}`;
    log.fatal(err);
    throw Error(err);
  }
}

// Path: packages/gateway/src/handleGameMessage.ts
