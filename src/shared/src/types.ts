import type { KeypressEvent } from "@rustymotors/shared";
import type { Socket } from "node:net";
import type { McosEncryptionPair } from "../src/encryption.js";
import type { Configuration } from "./Configuration.js";

export interface TServerLogger {
  info: (message: string) => void;
  error: (message: string) => void;
  fatal: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
  trace: (message: string) => void;
  setName: (name: string) => void;
  getName: () => string;
  resetName: () => void;
}

export interface UserRecordMini {
  contextId: string;
  customerId: number;
  userId: number;
}

export interface TConsoleThread {
  parentThread: TGateway;
  handleKeypressEvent: (key: KeypressEvent) => void;
  init: () => void;
  run: () => void;
  stop: () => void;
}

export interface TScheduledThread {
  parentThread: TGateway;
  stop(): void;
}

export interface TGatewayOptions {
  config?: Configuration;
  log: TServerLogger;
  backlogAllowedCount?: number;
  listeningPortList?: number[];
  socketConnectionHandler?: ({
    incomingSocket,
    log,
  }: {
    incomingSocket: Socket;
    log: TServerLogger;
  }) => void;
}

export interface TGateway {
  config: Configuration;
  log: TServerLogger;
  timer: NodeJS.Timeout | null;
  loopInterval: number;
  status: string;
  consoleEvents: string[];
  backlogAllowedCount: number;
  listeningPortList: number[];
  servers: import("node:net").Server[];
  socketconnection: ({
    incomingSocket,
    log,
  }: {
    incomingSocket: Socket;
    log: TServerLogger;
  }) => void;
  webServer: import("fastify").FastifyInstance | undefined;
  readThread: TConsoleThread | undefined;
  scheduledThread: TScheduledThread | undefined;
  start: () => Promise<void>;
  restart: () => Promise<void>;
  exit: () => Promise<void>;
  stop: () => Promise<void>;
  help: () => void;
  run: () => void;
  handleReadThreadEvent: (event: string) => void;
  init: () => Promise<void>;
  shutdown: () => void;
}

export interface IConnection {
  getConnectionId(): string;
  getPersonaId(): number;
  setChannelSecure(channelSecure: boolean): void;
  isChannelSecure(): boolean;
  setCipherPair(cipherPair: McosEncryptionPair): void;
  handleServerSocketData(data: Buffer): void;
  sendServerMessage(messages: IMessage[]): void;
  close(): void;
}

export interface ISerializable {
  serialize(): Buffer;
  deserialize(data: Buffer): void;
  getByteSize(): number;
  toString(): string;
  toHexString(): string;
}

export interface IMessage extends ISerializable {
  header: ISerializable;
  getData(): ISerializable;
  getDataBuffer(): Buffer;
  setData(data: ISerializable): void;
  setDataBuffer(data: Buffer): void;
}