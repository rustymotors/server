/**
 * @module mcos/shared
 */
import { NetworkSocket, ClientMessageHeader, ClientConnection, ClientMessage, ServerConfiguration } from "../interfaces/index.js";
export { toHex } from "./utils.js";
export { BinaryStructureBase as BinaryStructure, ByteField, } from "./BinaryStructure.js";
export { TransactionMessageBase as TSMessageBase } from "./TMessageBase.js";
export { setConfiguration, getServerConfiguration, } from "./ServerConfiguration.js";
export { NPSMessage } from "./NPSMessage.js";
export { getServerLogger, getLevelValue } from "./log.js";
export { ServerError } from "./errors/ServerError.js";
export { SubThread } from "./SubThread.js";
export { Connection } from "./Connection.js";
export { Message } from "./Message.js";
export { MessageHeader } from "./MessageHeader.js";
export { SerializerBase } from "./SerializerBase.js";
export { MessageNode } from "./MessageNode.js";
export declare function ISocketTestFactory(): NetworkSocket;
export declare function IMessageHeaderFactory(): ClientMessageHeader;
export declare function IConnectionFactory(): ClientConnection;
export declare function IMessageFactory(): ClientMessage;
export declare function ITCPHeaderFactory(): ClientMessageHeader;
export declare function ITCPMessageFactory(): ClientMessage;
export declare function TServerConfigurationFactory(): ServerConfiguration;
//# sourceMappingURL=index.d.ts.map