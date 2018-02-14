import { Cipher, Decipher } from "crypto";
import { Socket } from "net";
import ConnectionMgr from "./connectionMgr";

export class Connection {
  public remoteAddress: string;
  public localPort: number;
  public sock: Socket;
  public id: number;
  public inQueue: boolean;
  public enc: {
    cypher?: Cipher,
    decipher?: Decipher
  };
  public useEncryption: boolean;
  public isSetupComplete: boolean;
  public decryptedCmd: Buffer;
  public encryptedCommand: Buffer;
  private appID: number;
  private status: string;
  private msgEvent: null;
  private lastMsg: number;
  private mgr: ConnectionMgr;

  constructor(connectionId: number, sock: Socket, mgr: ConnectionMgr) {
    this.id = connectionId;
    this.appID = 0;
    this.status = "INACTIVE";
    this.remoteAddress = sock.remoteAddress;
    this.localPort = sock.localPort;
    this.sock = sock;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = false;
    this.enc = {};
    this.isSetupComplete = false;
    this.mgr = mgr;
    this.inQueue = true;
  }
}
