import type { ServerMessage } from "../../shared-packets/src/ServerMessage";
import { processStockCarInfo } from "./processStockCarInfo";

export type SocketCallback = (messages: Buffer[]) => void;

export type ServerMessageProcessor = (
    connectionId: string,
    message: ServerMessage,
    socketCallback: SocketCallback,
) => Promise<void>;

export const serverMessageProcessors = new Map<number, ServerMessageProcessor>([]);

export function populateServerMessageProcessors() {
    serverMessageProcessors.set(141, processStockCarInfo)
};

export function getServerMessageProcessor(messageId: number) {
    return serverMessageProcessors.get(messageId);
}



