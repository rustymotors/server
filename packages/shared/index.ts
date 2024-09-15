import { LegacyMessage } from "./LegacyMessage.js";

export { SubThread } from "./SubThread.js";
export { NetworkMessage } from "./src/NetworkMessage.js";
export { ServerLogger, getServerLogger } from "./src/log.js";
export { Configuration, getServerConfiguration } from "./Configuration.js";
export { SerializedBuffer } from "./src/SerializedBuffer.js";
export { SerializedBufferOld } from "./SerializedBufferOld.js";
export { RawMessage } from "./src/RawMessage.js";
export { ServerMessage } from "./src/ServerMessage.js";
export { AbstractSerializable, SerializableMixin } from "./messageFactory.js";
export { ServerError } from "./src/ServerError.js";
export { NPSMessage } from "./NPSMessage.js";
export { OldServerMessage } from "./OldServerMessage.js";
export { MessageBufferOld } from "./MessageBufferOld.js";
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
} from "./State.js";
export type { State } from "./State.js";
export type { OnDataHandler, ServiceResponse } from "./State.js";
export { LegacyMessage } from "./LegacyMessage.js";
export { NPSHeader } from "./NPSHeader.js";
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
