import { Socket } from "net";
import ConnectionMgr from "./connectionMgr";

export class Connection {
  public remoteAddress: string;
  public localPort: number;
  public sock: Socket;
  public id: number;
  public inQueue: boolean;
  private appID: number;
  private status: string;
  private msgEvent: null;
  private lastMsg: number;
  private useEncryption: boolean;
  private enc: object;
  private isSetupComplete: boolean;
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
