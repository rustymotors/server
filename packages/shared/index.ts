export { SubThread } from "./SubThread.js";
export { NetworkMessage } from "./src/NetworkMessage.js";
export { ServerLogger, getServerLogger } from "./src/log.js";
export { Configuration, getServerConfiguration } from "./Configuration.js";
export {
    McosEncryptionPair,
    createInitialState,
    addOnDataHandler,
    fetchStateFromDatabase,
    getOnDataHandler,
    addSocket,
    removeSocket,
    wrapSocket,
    McosEncryption,
    addEncryption,
    getEncryption,
    McosSession,
    updateEncryption,
    findSessionByConnectionId,
    addSession,
} from "./State.js";
export type { OnDataHandler, ServiceResponse, State } from "./State.js";
export {
    SerializedBuffer,
    LegacyMessage,
    MessageBuffer,
    GameMessage,
    serializeString,
    NPSMessage,
    deserializeString,
    serializeStringRaw,
    NPSHeader,
} from "./messageFactory.js";
export { RawMessage } from "./src/RawMessage.js";
export { ServerMessage } from "./src/ServerMessage.js";
export { MessageNode } from "./MessageNode.js";
export type * from "./src/types.js";
export { Timestamp } from "./Timestamp.js";

export interface KeypressEvent {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}

export interface ConnectionRecord {
    customerId: number;
    connectionId: string;
    sessionKey: string;
    sKey: string;
    contextId: string;
}

