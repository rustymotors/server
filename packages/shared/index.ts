export { SubThread } from "./src/SubThread.js";
export { NetworkMessage } from "./src/NetworkMessage.js";
export { getServerLogger } from "./src/log.js";
export type { ServerLogger } from "./src/log.js";
export { Configuration, getServerConfiguration } from "./src/Configuration.js";
export { SerializedBuffer } from "./src/SerializedBuffer.js";
export { SerializedBufferOld } from "./src/SerializedBufferOld.js";
export { RawMessage } from "./src/RawMessage.js";
export { ServerMessage } from "./src/ServerMessage.js";
export {
    AbstractSerializable,
    SerializableMixin,
} from "./src/messageFactory.js";
export { NPSMessage } from "./src/NPSMessage.js";
export { OldServerMessage } from "./src/OldServerMessage.js";
export { MessageBufferOld } from "./src/MessageBufferOld.js";
export { GameMessage } from "./src/GameMessage.js";
export { serializeString } from "./src/serializeString.js";
export { deserializeString } from "./src/deserializeString.js";
export { serializeStringRaw } from "./src/serializeStringRaw.js";
export { MessageNode } from "./src/MessageNode.js";
export { Timestamp } from "./src/TimeStamp.js";
export {
    McosEncryptionPair,
    McosEncryption,
    addSession,
    createInitialState,
    fetchStateFromDatabase,
    addOnDataHandler,
    addSocket,
    getOnDataHandler,
    removeSocket,
    wrapSocket,
    addEncryption,
    getEncryption,
    McosSession,
    findSessionByConnectionId,
    updateEncryption,
} from "./src/State.js";
export type { State } from "./src/State.js";
export type { OnDataHandler, ServiceResponse } from "./src/State.js";
export { LegacyMessage } from "./src/LegacyMessage.js";
export { NPSHeader } from "./src/NPSHeader.js";
export * from "./src/interfaces.js";

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
