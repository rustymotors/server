import { Buffer } from "buffer";
import { logger } from "../logger/index.js";
const log = logger.child({ service: "npacket" });

export class NPacket {
  /** the connection this packet belongs to. May be blank if newly created */
  private connectionId = "";

  /** length of the packet when serialized */
  private length = -1;

  /** nps opcode */
  private packetTypeId = -1;

  /** the version of the nps protocol */
  private messageVersion = -1;

  /** the message contents */
  private buffer = Buffer.alloc(0);

  /** was the packet deserilized? */
  public wasDeserialized = false;

  public static deserialize(inputBuffer: Buffer, connectionId = ""): NPacket {
    const newMessage = new NPacket();

    newMessage.connectionId = connectionId;
    newMessage.packetTypeId = inputBuffer.readInt16BE(0);
    newMessage.length = inputBuffer.readInt16BE(2);
    newMessage.messageVersion = inputBuffer.readInt16BE(4);

    // We skip index 6 and 7, this is a reserved field that is always 0

    console.log(`Unknown Section: ${inputBuffer.slice(8, 12).toString("hex")}`);

    newMessage.buffer = inputBuffer.slice(12);

    return newMessage;
  }

  public serialize() {
    const newPacket = Buffer.alloc(this.length);
    this.buffer.copy(newPacket);
  }

  async processPacket() {
    log.debug(
      { connection_id: this.getConnectionId() },
      "Start processing packet"
    );
  }

  public getConnectionId() {
    return this.connectionId;
  }

  public getJSON() {
    const { packetTypeId, length, messageVersion } = this;

    return {
      packetTypeId,
      length,
      messageVersion,
    };
  }

  public toString() {
    return JSON.stringify({
      packetTypeId: this.packetTypeId,
      length: this.length,
      messageVersion: this.messageVersion,
    });
  }
}
