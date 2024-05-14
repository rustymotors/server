import { McosEncryptionPair, getServerLogger } from "shared";
import { Serializable } from "./BasePacket.js";
import type { IMessage, ISerializable } from "./interfaces.js";

const log = getServerLogger();

/**
 *
 */
export class ServerMessageHeader extends Serializable implements ISerializable {
  // All fields are little-endian
  private length: number = 0; // 2 bytes
  private signature: string = ""; // 4 bytes
  private sequence: number = 0; // 4 bytes
  private flags: number = 0; // 1

  getDataOffset(): number {
    return 11;
  }
  override getByteSize(): number {
    return 11;
  }

  getLength(): number {
    return this.length;
  }

  override serialize(): Buffer {
    const buffer = Buffer.alloc(this.getByteSize());
    buffer.writeUInt16LE(this.length, 0);
    buffer.write(this.signature, 2, 4, "ascii");
    buffer.writeUInt32LE(this.sequence, 6);
    buffer.writeUInt8(this.flags, 10);

    return buffer;
  }

  override deserialize(data: Buffer): ServerMessageHeader {
    this._assertEnoughData(data, this.getByteSize());

    this.length = data.readUInt16LE(0);
    this.signature = data.toString("utf8", 2, 6);
    this.sequence = data.readUInt32LE(6);
    this.flags = data.readUInt8(10);

    return this;
  }

  isValidSignature(): boolean {
    return this.signature === "TOMC";
  }

  isPayloadEncrypted(): boolean {
    // Does the flags bitmask contain have 0x08 set?
    return this.flags >= 0x08;
  }

  setPayloadEncryption(encrypted: boolean): ServerMessageHeader {
    if (encrypted) {
      this.flags |= 0x08;
    } else {
      this.flags &= ~0x08;
    }
    return this;
  }

  toString(): string {
    return `ServerMessageHeader {length: ${this.length}, signature: ${this.signature}, sequence: ${this.sequence}, flags: ${this.flags}}`;
  }

  toHexString(): string {
    return this.serialize().toString("hex");
  }

  getSequence(): number {
    return this.sequence;
  }

  setSequence(sequence: number): ServerMessageHeader {
    this.sequence = sequence;
    return this;
  }

  setLength(length: number): ServerMessageHeader {
    this.length = length;
    return this;
  }

  setSignature(signature: string): ServerMessageHeader {
    this.signature = signature;
    return this;
  }
}

export class ServerMessagePayload
  extends Serializable
  implements ISerializable
{
  protected messageId: number = 0; // 2 bytes

  override getByteSize(): number {
    return 2 + this._data.length;
  }

  override serialize(): Buffer {
    const buffer = Buffer.alloc(this.getByteSize());
    buffer.writeUInt16LE(this.messageId, 0);
    this._data.copy(buffer, 2);

    return buffer;
  }

  override deserialize(data: Buffer): ServerMessagePayload {
    this._assertEnoughData(data, 2);

    this.messageId = data.readUInt16LE(0);
    this._data = data.subarray(2);

    return this;
  }

  getMessageId(): number {
    return this.messageId;
  }

  setMessageId(messageId: number): ServerMessagePayload {
    this.messageId = messageId;
    return this;
  }
}

export class ServerGenericRequest extends ServerMessagePayload {
  private _data2: Buffer = Buffer.alloc(4);

  override getByteSize(): number {
    return 2 + 4 + 4;
  }

  override serialize(): Buffer {
    try {
      const buffer = Buffer.alloc(this.getByteSize());
      buffer.writeUInt16LE(this.messageId, 0);
      buffer.writeUInt32LE(this._data.readUInt32LE(0), 2);
      buffer.writeUInt32LE(this._data2.readUInt32LE(0), 6);

      return buffer;
    } catch (error) {
      log.error(`Error serializing ServerGenericRequest: ${error as string}`);
      throw error;
    }
  }

  override deserialize(data: Buffer): ServerGenericRequest {
    try {
      this._assertEnoughData(data, this.getByteSize());

      this.messageId = data.readUInt16LE(0);
      this._data = data.subarray(2, 6);
      this._data2 = data.subarray(6, 10);

      return this;
    } catch (error) {
      log.error(`Error deserializing ServerGenericRequest: ${error as string}`);
      throw error;
    }
  }

  getData() {
    return this._data;
  }

  getData2() {
    return this._data2;
  }

  toString(): string {
    return `ServerGenericRequest {messageId: ${
      this.messageId
    }, data: ${this._data.toString("hex")}, data2: ${this._data2.toString(
      "hex"
    )}}`;
  }
}

export class ServerGenericResponse extends ServerMessagePayload {
  private _msgReply: number = 0; // 2 bytes
  private _result: number = 0; // 4
  private _data2: Buffer = Buffer.alloc(4);

  override getByteSize(): number {
    return 2 + 2 + 4 + 4 + 4;
  }

  override serialize(): Buffer {
    const buffer = Buffer.alloc(this.getByteSize());
    buffer.writeUInt16LE(this.messageId, 0);
    buffer.writeUInt16LE(this._msgReply, 2);
    buffer.writeUInt32LE(this._result, 4);
    buffer.writeUInt32LE(this._data.readUInt32LE(0), 8);
    buffer.writeUInt32LE(this._data2.readUInt32LE(0), 12);

    return buffer;
  }

  override deserialize(data: Buffer): ServerGenericResponse {
    this._assertEnoughData(data, this.getByteSize());

    this.messageId = data.readUInt16LE(0);
    this._msgReply = data.readUInt16LE(2);
    this._result = data.readUInt32LE(4);
    this._data = data.subarray(2, 6);
    this._data = data.subarray(6, 10);

    return this;
  }

  getMessageReply(): number {
    return this._msgReply;
  }

  getResult(): number {
    return this._result;
  }

  setMsgReply(msgReply: number): ServerGenericResponse {
    this._msgReply = msgReply;
    return this;
  }

  toString(): string {
    return `ServerGenericResponse {messageId: ${this.messageId}, msgReply: ${
      this._msgReply
    }, result: ${this._result}, data: ${this._data.toString(
      "hex"
    )}, data2: ${this._data2.toString("hex")}}`;
  }
}

export class ServerMessage extends Serializable implements IMessage {
  header: ServerMessageHeader;
  data: ServerMessagePayload;
  private _preDecryptedMessageId: number = -1;
  private _preEncryptedMessageId: number = -1;

  constructor(messageId: number) {
    super();
    this.header = new ServerMessageHeader();
    this.data = new ServerMessagePayload().setMessageId(messageId);
  }
  getDataBuffer(): Buffer {
    return this.data.serialize();
  }
  setDataBuffer(data: Buffer): ServerMessage {
    this.data.deserialize(data);
    return this;
  }
  /** The message length is the length of the message data, not including the id */
  override getByteSize(): number {
    return this.header.getByteSize() + this.data.getByteSize();
  }

  populateHeader(seq?: number): ServerMessage {
    this.header.setLength(
      this.header.getByteSize() + this.data.getByteSize() - 2
    );
    this.header.setSignature("TOMC");
    this.header.setSequence(seq || 0);

    return this;
  }

  getData(): ISerializable {
    return this.data;
  }
  setData(data: ServerMessagePayload): ServerMessage {
    this.data = data;
    return this;
  }
  override serialize(): Buffer {
    try {
      if (this.header.getSequence() === 0) {
        throw new Error(
          "ServerMessage sequence is 0, it must be set to a non-zero value before serializing"
        );
      }

      if (!this.header.isValidSignature()) {
        throw new Error(
          "ServerMessage signature is invalid, it must be set to 'TOMC' before serializing"
        );
      }

      if (this.header.getByteSize() === 0) {
        throw new Error(
          "ServerMessage header byte size is 0, it must be set before serializing"
        );
      }

      const buffer = Buffer.alloc(this.getByteSize());
      const headerBuffer = this.header.serialize();
      const dataBuffer = this.getDataBuffer();

      headerBuffer.copy(buffer);
      dataBuffer.copy(buffer, this.header.getDataOffset());

      return buffer;
    } catch (error) {
      log.error(`Error serializing ServerMessage: ${error as string}`);
      throw error;
    }
  }
  override deserialize(data: Buffer): ServerMessage {
    this._assertEnoughData(data, this.header.getByteSize());

    this.header.deserialize(data);
    this.setDataBuffer(data.subarray(this.header.getDataOffset()));

    return this;
  }

  isEncrypted() {
    return this.header.isPayloadEncrypted();
  }

  decrypt(cipherPair: McosEncryptionPair): ServerMessage {
    log.setName("ServerMessage::decrypt");
    if (this.isEncrypted()) {
      try {
        this._preDecryptedMessageId = this.data.getMessageId();
        log.debug(
          `Decrypting ServerMessage with message id ${this.data.getMessageId()}`
        );
        this.setDataBuffer(cipherPair.decrypt(this.getDataBuffer()));
        log.debug(
          `Decrypted ServerMessage with message id ${
            this._preDecryptedMessageId
          }, new message id: ${this.data.getMessageId()}`
        );
        this.header.setPayloadEncryption(false);
      } catch (error) {
        log.error(`Error decrypting ServerMessage: ${error as string}`);
        throw error;
      }
    }
    log.resetName();
    return this;
  }

  encrypt(cipherPair: McosEncryptionPair): ServerMessage {
    log.setName("ServerMessage::encrypt");
    if (!this.isEncrypted()) {
      try {
        this._preEncryptedMessageId = this.data.getMessageId();
        log.debug(
          `Encrypting ServerMessage with message id ${this.data.getMessageId()}`
        );
        this.setDataBuffer(cipherPair.encrypt(this.getDataBuffer()));
        log.debug(
          `Encrypted ServerMessage with message id ${
            this._preEncryptedMessageId
          }, new message id: ${this.data.getMessageId()}`
        );
        this.header.setPayloadEncryption(true);
      } catch (error) {
        log.error(`Error encrypting ServerMessage: ${error as string}`);
        throw error;
      }
    }
    log.resetName();
    return this;
  }

  getId() {
    return this.data.getMessageId();
  }

  getSequence() {
    return this.header.getSequence();
  }

  toString(): string {
    return `ServerMessage {length: ${this.header.getLength()}, id: ${this.data.getMessageId()}}`;
  }

  getPreDecryptedMessageId() {
    return this._preDecryptedMessageId;
  }

  getPreEncryptedMessageId() {
    return this._preEncryptedMessageId;
  }
}
