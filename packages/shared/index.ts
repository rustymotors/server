/**
 * @module mcos/shared
 */

import EventEmitter from "node:events";
import {
    NetworkSocket,
    ClientMessageHeader,
    ClientConnection,
    ClientMessage,
} from "../interfaces/index.js";
import { Configuration } from "./Configuration.js";

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

export function TServerConfigurationFactory(): Configuration {
    return {
        host: "",
        certificateFile: "",
        privateKeyFile: "",
        publicKeyFile: "",
        logLevel: "",
    };
}
