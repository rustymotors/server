export { SubThread } from "./SubThread.js";
export { NetworkMessage } from "./src/NetworkMessage.js";
export { ServerLogger, getServerLogger } from "./src/log.js";
export { Configuration, getServerConfiguration } from "./Configuration.js";
export { SerializedBuffer } from "./src/SerializedBuffer.js";
export { RawMessage } from "./src/RawMessage.js";
export { ServerMessage } from "./src/ServerMessage.js";
export { ServerError } from "./errors/ServerError.js";
export {
    McosEncryptionPair,
    McosEncryption, addSession,
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
