import { BareMessage } from "./BareMessage.js";

type MessageProcessor = (connectionId: string, message: BareMessage) => void;

export class MessageProcessorError extends Error {
    messageId: number;
    constructor(id: number, message: string) {
        super(message);
        this.name = "MessageProcessorError";
        this.messageId = id;
    }

    override toString(): string {
        return `${this.name}: ${this.message}`;
    }
}

const messageProcessors = new Map<number, MessageProcessor>([]);

export function getMessageProcessor(messageId: number): MessageProcessor {
    if (messageProcessors.has(messageId)) {
        // @ts-ignore - we know this will be defined since we checked above
        return messageProcessors.get(messageId);
    }
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
    throw new PortMapError(port, "No message type found");
}
