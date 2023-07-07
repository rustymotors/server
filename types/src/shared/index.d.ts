/**
 * @module mcos/shared
 */
import { IConnection, IMessage, IMessageHeader, ISocket, ITCPHeader, ITCPMessage, TConfiguration, TServerLogger } from "./interfaces.js";
export { toHex } from "./utils.js";
export { BinaryStructureBase as BinaryStructure, ByteField, } from "./BinaryStructure.js";
export { TransactionMessageBase as TSMessageBase } from "./TMessageBase.js";
export { setConfiguration, getConfiguration, getServerConfiguration, } from "./ServerConfiguration.js";
export { NPSMessage } from "./NPSMessage.js";
export { getServerLogger as GetServerLogger } from "./log.js";
export { Sentry } from "./sentry.js";
export { ServerError } from "./errors/ServerError.js";
export { SubThread } from "./SubThread.js";
export { Connection } from "./Connection.js";
export { Message } from "./Message.js";
export { MessageHeader } from "./MessageHeader.js";
export { SerializerBase } from "./SerializerBase.js";
export { TCPHeader } from "./TCPHeader.js";
export { TCPMessage } from "./TCPMessage.js";
export { MessageNode } from "./MessageNode.js";
export declare function ISocketTestFactory(): ISocket;
export declare function IMessageHeaderFactory(): IMessageHeader;
export declare function IConnectionFactory(): IConnection;
export declare function IMessageFactory(): IMessage;
export declare function ITCPHeaderFactory(): ITCPHeader;
export declare function ITCPMessageFactory(): ITCPMessage;
export declare function TServerConfigurationFactory(): TConfiguration;
export declare function TServerLoggerFactory(): TServerLogger;
