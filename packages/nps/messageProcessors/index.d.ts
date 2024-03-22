/// <reference types="node" />
import { GameMessage } from "../messageStructs/GameMessage.js";
export type SocketCallback = (messages: Buffer[]) => void;
export type MessageProcessor = (
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
) => Promise<void>;
export declare class MessageProcessorError extends Error {
    constructor(id: number, message: string);
}
export declare const gameMessageProcessors: Map<number, MessageProcessor>;
export declare function populateGameMessageProcessors(
    processors: Map<number, MessageProcessor>,
): void;
export declare function getGameMessageProcessor(
    messageId: number,
): MessageProcessor;
export declare class PortMapError extends Error {
    port: number;
    constructor(port: number, message: string);
    toString(): string;
}
export declare const portToMessageTypes: Map<number, string>;
export declare function populatePortToMessageTypes(
    portMap: Map<number, string>,
): void;
export declare function getPortMessageType(port: number): string;
