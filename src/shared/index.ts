export { Configuration, getServerConfiguration } from "./src/Configuration.js";
export { NetworkMessage } from "./src/NetworkMessage.js";
export { SubThread } from "./src/SubThread.js";
export { ServerLogger, getServerLogger } from "./src/log.js";

export { RawMessage } from "./src/RawMessage.js";
export { ServerMessage } from "./src/ServerMessage.js";
export type * from "./src/types.js";
export { now32 } from "./src/utils.js";

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

export { mockLogger } from "./test/index.js";
