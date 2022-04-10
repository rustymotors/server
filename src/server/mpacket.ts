import { Buffer } from "buffer";
import { logger } from "../logger/index.js";
const log = logger.child({ service: "mpacket" });

export interface IMPacketFlags {
  shouldCompress: boolean;
  isText: boolean;
  useEncryption: boolean;
  isLastPacket: boolean;
  isHeartbeat: boolean;
  isCompressed: boolean;
}

export class MPacket {
  /** the connection this packet belongs to. May be blank if newly created */
  private connectionId = "";
  // /** the creator of the packet*/
  // private source = -1
  /** the user id this packet is about */
  private userid = -1;
  /** the total size of the packet when serialized */
  public packetSize = -1;
  /** the packet type.
   * Set to MCOT when the source or destination is the server
   * Otherwise assumed to be a packet set to this type in error
   */
  public headerId = "";
  /** this packet's number in the processing sequence */
  public sequenceNumber = -1;
  /** possble flags providing matadata about the packet */
  public flags = {
    /** should this packet be conpressed when sending? */
    shouldCompress: false,
    /** the content of the buffer is ASCII text.
     * isCompressed should also be true if this is trus
     */
    isText: false,
    /** ths packet should be encrypted prior to sending */
    useEncryption: false,
    /** if set, the socket can be closed after sending */
    isLastPacket: false,
    /** this is a heartbeat packet */
    isHeartbeat: false,
    /** is this packet current compressed? */
    isCompressed: false,
  };
  /** the binary contents of the packet */
  public buffer = Buffer.alloc(0);
  /** has deserialize() been called? */
  public wasDeserialized = false;
/**
 * Set the internal flags
 *
 * @private
 * @param {Buffer[1]} flagsByte
 * @memberof MPacket
 */
private setFlags(flagsByte: Buffer[1]) {
    if (flagsByte & 0x80) this.flags.isHeartbeat = true;
    if (flagsByte & 0x10) this.flags.isLastPacket = true;
    if (flagsByte & 0x08) this.flags.useEncryption = true;
    if (flagsByte & 0x04) this.flags.isText = true;
    if (flagsByte & 0x02) this.flags.isCompressed = true;
    if (flagsByte & 0x01) this.flags.shouldCompress = true;
  }
/**
 * Marchell raw Buffer into an MPacket structure
 *
 * @static
 * @param {Buffer} inputBuffer
 * @param {string} [connectionId=""]
 * @return {*}  {MPacket}
 * @memberof MPacket
 */
public static deserialize(inputBuffer: Buffer, connectionId = ""): MPacket {
    const newMPacket = new MPacket();
    newMPacket.connectionId = connectionId;
    newMPacket.packetSize = inputBuffer.readUInt16LE(0);
    newMPacket.headerId = inputBuffer.toString("utf8", 2, 6);
    newMPacket.sequenceNumber = inputBuffer.readUInt16LE(6);
    newMPacket.setFlags(inputBuffer[8] || 0);
    newMPacket.buffer = inputBuffer.slice(9);
    newMPacket.wasDeserialized = true;
    return newMPacket;
  }
/**
 * Handle incomming MPacket
 *
 * @memberof MPacket
 */
public processPacket(): void {
    log.debug(
      { connection_id: this.getConnectionId() },
      "Start processing packet"
    );
  }
/**
 * Get packet flags
 *
 * @return {*}  {IMPacketFlags}
 * @memberof MPacket
 */
public getFlags(): IMPacketFlags {
    return this.flags;
  }
  /**
   * Get packet as JSON
   *
   * @return {*}
   * @memberof MPacket
   */
  public getJSON() {
    const { packetSize, headerId, sequenceNumber, flags, wasDeserialized } =
      this;
    return { packetSize, headerId, sequenceNumber, flags, wasDeserialized };
  }
  /**
   * Get packet as string
   *
   * @return {*}  {string}
   * @memberof MPacket
   */
  public toString(): string {
    return JSON.stringify(this.getJSON());
  }
  /**
   * Get the connection id
   *
   * @return {*}  {string}
   * @memberof MPacket
   */
  public getConnectionId(): string {
    return this.connectionId;
  }
  /**
   * Get the user id
   *
   * @return {*}  {number}
   * @memberof MPacket
   */
  public getUserId(): number {
    return this.userid;
  }
  /**
   * Set the user id
   *
   * @param {number} userId
   * @memberof MPacket
   */
  public setUserId(userId: number): void {
    this.userid = userId;
  }
}
