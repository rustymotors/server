/// <reference types="node" />
import { Socket } from "net";
import { Duplex, EventEmitter } from "stream";
export declare class SocketFactory extends Duplex implements EventEmitter {
  static createSocket(): Socket;
}
