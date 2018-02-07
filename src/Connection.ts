import { Socket } from "net";
import ConnectionMgr from "./connectionMgr";

export class Connection {
  public id: number;
  private appID: number;
  private status: string;
  public remoteAddress: string;
  public localPort: number;
  public sock: Socket;
  private msgEvent: null;
  private lastMsg: number;
  private useEncryption: boolean;
  private enc: object;
  private isSetupComplete: boolean;
  private mgr: ConnectionMgr;
  public inQueue: boolean;

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
