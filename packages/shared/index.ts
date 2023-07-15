/**
 * @module mcos/shared
 */

import EventEmitter from "node:events";
import {
    ClientConnection,
    ClientMessage,
    ClientMessageHeader,
    NetworkSocket,
    ServerConfiguration,
} from "@mcos/interfaces";
export { toHex } from "./utils.js";

export {
    BinaryStructureBase as BinaryStructure,
    ByteField,
} from "./BinaryStructure.js";
export { TransactionMessageBase as TSMessageBase } from "./TMessageBase.js";

export {
    setConfiguration,
    getServerConfiguration,
} from "./ServerConfiguration.js";
export { NPSMessage } from "./NPSMessage.js";
export { getServerLogger as GetServerLogger } from "./log.js";
export { Sentry } from "./sentry.js";
export { ServerError } from "./errors/ServerError.js";
export { SubThread } from "./SubThread.js";
export { Connection } from "./Connection.js";
export { Message } from "./Message.js";
export { MessageHeader } from "./MessageHeader.js";
export { SerializerBase } from "./SerializerBase.js";
export { MessageNode } from "./MessageNode.js";

export function ISocketTestFactory(): NetworkSocket {
    const ee = new EventEmitter();
    const et = new EventTarget();
    const newISocket = {
        write: () => true,
        end: () => {
            // do nothing
        },
        destroy: () => {
            // do nothing
        },
        writable: true,
        remoteAddress: "",
        localPort: 0,
        ...ee,
        ...et,
    };
    Object.setPrototypeOf(newISocket, Object.getPrototypeOf(ee));
    return newISocket;
}

export function IMessageHeaderFactory(): ClientMessageHeader {
    return {
        length: 0,
        signature: "",

        serialize: () => Buffer.from([]),
    };
}

export function IConnectionFactory(): ClientConnection {
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
        encryptionSession: undefined,
        ip: null,
    };
}

export function IMessageFactory(): ClientMessage {
    return {
        opCode: 0,
        toFrom: 0,
        connectionId: "",
        appId: 0,
        sequence: 0,
        flags: 0,
        rawBuffer: Buffer.from([]),
        header: null,

        serialize: () => Buffer.from([]),
        toString: () => "",
        serializeSize: () => 0,        
        deserialize: () => IMessageFactory(),
    };
}

export function ITCPHeaderFactory(): ClientMessageHeader {
    return {
        length: 0,
        signature: "",
        serialize: () => Buffer.from([]),

    };
}

export function ITCPMessageFactory(): ClientMessage {
    return {
        connectionId: null,
        toFrom: 0,
        appId: 0,
        header: null,
        opCode: 0,
        sequence: 0,
        flags: 0,
        serialize: () => Buffer.from([]),
        serializeSize: () => 0,
        rawBuffer: Buffer.from([]),

        deserialize: () => ITCPMessageFactory(),
    };
}

export function TServerConfigurationFactory(): ServerConfiguration {
    return {
        EXTERNAL_HOST: "",
        certificateFileContents: "",
        privateKeyContents: "",
        publicKeyContents: "",
        LOG_LEVEL: "debug",
    };
}
