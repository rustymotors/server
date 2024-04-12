import type {
    OldServerMessage,
    ServerMessage,
    ServerMessageType,
    TServerLogger,
} from "rusty-shared";
export interface MessageHandlerArgs {
    connectionId: string;
    packet: ServerMessageType;
    log: TServerLogger;
}
export interface MessageHandlerResult {
    connectionId: string;
    messages: OldServerMessage[] | ServerMessage[];
}
export interface MessageHandler {
    name: string;
    direction: "in" | "out" | "both";
    handler: (args: MessageHandlerArgs) => Promise<MessageHandlerResult>;
}
