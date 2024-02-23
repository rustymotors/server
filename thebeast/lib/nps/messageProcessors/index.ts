import { processUserLogin } from "./processUserLogin.js";
import { processGetProfileMaps } from "./processGetProfileMaps.js";
import { processCheckProfileName } from "./processCheckProfileName.js";
import { processCheckPlateText } from "./processCheckPlateText.js";
import { processCreateProfile } from "./processCreateProfile.js";
import { processDeleteProfile } from "./processDeleteProfile.js";
import { processGetProfileInfo } from "./processGetProfileInfo.js";
import { processGameLogin } from "./processGameLogin.js";
import { processLobbyLogin } from "./processLobbyLogin.js";
import { processFirstBuddy } from "./processGetFirstBuddy.js";
import { processEncryptedGameCommand } from "./processEncryptedGameCommand.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { processPing } from "./processPing.js";
import { log } from "../../../packages/shared/log.js";

export type SocketCallback = (messages: Buffer[]) => void;

export type MessageProcessor = (
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
) => Promise<void>;

export class MessageProcessorError extends Error {
    constructor(id: number, message: string) {
        super(`MessageProcessorError: ${id}: ${message}`);
    }
}

export const gameMessageProcessors = new Map<number, MessageProcessor>([]);

export function populateGameMessageProcessors(
    processors: Map<number, MessageProcessor>,
): void {
    processors.set(0x100, processLobbyLogin);
    processors.set(535, processPing); // 0x217
    processors.set(0x501, processUserLogin);
    processors.set(0x503, processGameLogin);
    processors.set(0x507, processCreateProfile);
    processors.set(0x50b, processFirstBuddy);
    processors.set(0x512, processDeleteProfile);
    processors.set(0x519, processGetProfileInfo);
    processors.set(0x532, processGetProfileMaps);
    processors.set(0x533, processCheckProfileName);
    processors.set(0x534, processCheckPlateText);
    processors.set(4353, processEncryptedGameCommand); // 0x1101
}

export function getGameMessageProcessor(messageId: number): MessageProcessor {
    if (gameMessageProcessors.has(messageId)) {
        // @ts-ignore - we know this will be defined since we checked above
        return gameMessageProcessors.get(messageId);
    }
    log.error(`No message processor found for message id ${messageId}`);
    throw new MessageProcessorError(messageId, "No message processor found");
}

export class PortMapError extends Error {
    port: number;
    constructor(port: number, message: string) {
        super(message);
        this.name = "PortMapError";
        this.port = port;
    }

    override toString(): string {
        return `${this.name}: ${this.message}`;
    }
}

export const portToMessageTypes = new Map<number, string>([]);

export function populatePortToMessageTypes(portMap: Map<number, string>): void {
    portMap.set(7003, "Game");
    portMap.set(8226, "Game");
    portMap.set(8228, "Game");
    portMap.set(43300, "Server");
}

export function getPortMessageType(port: number): string {
    if (portToMessageTypes.has(port)) {
        // @ts-ignore - we know this will be defined since we checked above
        return portToMessageTypes.get(port);
    }
    log.error(`No message type found for port ${port}`);
    throw new PortMapError(port, "No message type found");
}
