export { SubThread } from "./SubThread.js";
export { NetworkMessage } from "./src/NetworkMessage.js";
export { ServerLogger, getServerLogger } from "./src/log.js";
export { Configuration, getServerConfiguration } from "./Configuration.js";

export { RawMessage } from "./src/RawMessage.js";
export { ServerMessage } from "./src/ServerMessage.js";
export type * from "./src/types.js";

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

export {
    McosEncryptionPair,
    createCommandEncryptionPair,
    createDataEncryptionPair,
    verifyLegacyCipherSupport,
} from "./src/encryption.js";
