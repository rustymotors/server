/**
 * @module mcos/shared
 */

import EventEmitter from "node:events";
import {
    ELOG_LEVEL,
    IConnection,
    IMessage,
    IMessageHeader,
    ISocket,
    ITCPHeader,
    ITCPMessage,
    TServerConfiguration,
    TServerLogger,
} from "./interfaces.js";
export { toHex } from "./utils.js";

export {
    BinaryStructureBase as BinaryStructure,
    ByteField,
} from "./BinaryStructure.js";
export { TransactionMessageBase as TSMessageBase } from "./TMessageBase.js";

export {
    setServerConfiguration,
    getServerConfiguration,
} from "./ServerConfiguration.js";
export { NPSMessage } from "./NPSMessage.js";
export { getServerLogger as GetServerLogger } from "./log.js";
export { Sentry } from "./sentry.js";
export { ServerError } from "./ServerError.js";
export { Connection } from "./Connection.js";
export { Message } from "./Message.js";
export { MessageHeader } from "./MessageHeader.js";
export { SerializerBase } from "./SerializerBase.js";
export { TCPHeader } from "./TCPHeader.js";
export { TCPMessage } from "./TCPMessage.js";
export { MessageNode } from "./MessageNode.js";

export function ISocketTestFactory(): ISocket {
    const ee = new EventEmitter();
    const et = new EventTarget();
    const newISocket = {
        write: () => true,
        end: () => {},
        remoteAddress: "",
        localPort: 0,
        ...ee,
        ...et,
    };
    Object.setPrototypeOf(newISocket, Object.getPrototypeOf(ee));
    return newISocket;
}

export function IMessageHeaderFactory(): IMessageHeader {
    return {
        length: 0,
        signature: "",

        serialize: () => Buffer.from([]),
    };
}

export function IConnectionFactory(): IConnection {
    return {
        appID: 0,
        id: "",
        socket: ISocketTestFactory(),
        remoteAddress: "",
        seq: 0,
        personaId: 0,
        lastMessageTimestamp: 0,
        inQueue: false,
        useEncryption: false,
        status: 0,
        port: 0,
        encryption: null,
        ip: null,
    };
}

export function IMessageFactory(): IMessage {
    return {
        toFrom: 0,
        connectionId: "",
        appID: 0,
        sequence: 0,
        flags: 0,
        buffer: Buffer.from([]),
        header: null,

        serialize: () => Buffer.from([]),
        toString: () => "",
    };
}

export function ITCPHeaderFactory(): ITCPHeader {
    return {
        msgid: 0,
        msglen: 0,
        version: 0,
        reserved: 0,
        checksum: 0,

        serialize: () => Buffer.from([]),
        serializeSize: () => 0,
    };
}

export function ITCPMessageFactory(): ITCPMessage {
    return {
        connectionId: null,
        toFrom: 0,
        appId: 0,
        header: null,
        buffer: Buffer.from([]),
    };
}

export function TServerConfigurationFactory(): TServerConfiguration {
    return {
        EXTERNAL_HOST: "",
        certificateFileContents: "",
        privateKeyContents: "",
        publicKeyContents: "",
        LOG_LEVEL: "debug",
    };
}

export function TServerLoggerFactory(): TServerLogger {
    return (_level: ELOG_LEVEL, _msg: string) => {
        // do nothing
    };
}
