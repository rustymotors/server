import { Buffer } from "buffer";
import {LobbyInfoPacket} from "./lobbyInfo"

/**
 * @class
 * @property {number} msgNo
 * @property {number} noLobbies
 * @property {0 | 1} moreToCome
 * @property {LobbyInfoPacket} lobbyList
 * @property {number} dataLength
 * @property {Buffer} data
 */
 export class LobbyMessage {
    msgNo;
    noLobbies;
    moreToCome;
    lobbyList;
    dataLength;
    data;
    /**
     *
     */
    constructor() {
      this.msgNo = 325;
  
      this.noLobbies = 1;
      this.moreToCome = 0;
  
      this.lobbyList = new LobbyInfoPacket();
      // The expected length here is 572
      this.dataLength = this.lobbyList.toPacket().length + 5;
  
      if (this.dataLength !== 572) {
        throw new Error(
          `Unexpected length of packet! Expected 572, recieved ${this.dataLength.toString()}`
        );
      }
  
      this.data = Buffer.alloc(this.dataLength);
      this.data.writeInt16LE(this.msgNo, 0);
      this.data.writeInt16LE(this.noLobbies, 2);
      this.data.writeInt8(this.moreToCome, 4);
      this.lobbyList.toPacket().copy(this.data, 5);
      this.serviceName = "mcoserver:LobbyMsg";
    }
  
    /**
     *
     * @return {Buffer}
     */
    serialize() {
      return this.data;
    }
  
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket() {
      return `LobbyMsg',
          ${JSON.stringify({
            msgNo: this.msgNo,
            dataLength: this.dataLength,
            packet: this.serialize().toString("hex"),
          })}`;
    }
  }