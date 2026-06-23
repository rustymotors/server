import { BytableMessage, BytableStructure } from './BytableMessage.js';

/**
 * NPS_RiffInfo wire format — variable length.
 *
 * Serialized via NPS_Pack::pack format string "pllpssssbsslc".
 * 'p' fields write strlen+1 as the 4-byte BE prefix, then that many bytes.
 * 'b' channelData is always 256 bytes raw (no prefix).
 *
 *   p  riffName:           4-byte BE length (strlen+1) + string+null
 *   l  protocol:           4 bytes BE
 *   l  commId:             4 bytes BE
 *   p  password:           4-byte BE length (strlen+1) + string+null
 *   s  channelType:        2 bytes BE
 *   s  connectedUsers:     2 bytes BE
 *   s  openChannels:       2 bytes BE
 *   s  userIsConnected:    2 bytes BE
 *   b  channelData:        256 bytes raw (no prefix)
 *   s  numReadyPlayers:    2 bytes BE
 *   s  maxReadyPlayers:    2 bytes BE
 *   l  channelOwnerId:     4 bytes BE
 *   c  gameServerIsRunning: 1 byte
 */
export class NpsRiffInfo extends BytableStructure {
    private riffName_: string = '';
    private protocol_: number = 0;
    private commId_: number = 0;
    private password_: string = '';
    private channelType_: number = 0;
    private connectedUsers_: number = 0;
    private openChannels_: number = 0;
    private userIsConnected_: number = 0;
    private channelData_: Buffer = Buffer.alloc(256, 0);
    private numReadyPlayers_: number = 0;
    private maxReadyPlayers_: number = 0;
    private channelOwnerId_: number = 0;
    private gameServerIsRunning_: number = 0;

    // 'p' field: 4-byte BE prefix (strlen+1) + string bytes + null terminator
    private packString(str: string): Buffer {
        const strBuf = Buffer.from(str);
        const len = strBuf.length + 1; // +1 for null terminator
        const buf = Buffer.alloc(4 + len, 0);
        buf.writeUInt32BE(len, 0);
        strBuf.copy(buf, 4);
        // buf[4 + strBuf.length] is already 0 (null terminator)
        return buf;
    }

    override get serializeSize(): number {
        return (
            4 + Buffer.from(this.riffName_).length + 1 + // 'p' riffName
            4 +                                           // 'l' protocol
            4 +                                           // 'l' commId
            4 + Buffer.from(this.password_).length + 1 + // 'p' password
            2 + 2 + 2 + 2 +                              // 's' × 4
            256 +                                         // 'b' channelData
            2 + 2 +                                       // 's' × 2
            4 +                                           // 'l' channelOwnerId
            1                                             // 'c' gameServerIsRunning
        );
    }

    override serialize(): Buffer<ArrayBuffer> {
        const parts: Buffer[] = [];

        parts.push(this.packString(this.riffName_));

        const fixed = Buffer.alloc(4 + 4, 0);
        fixed.writeUInt32BE(this.protocol_, 0);
        fixed.writeInt32BE(this.commId_, 4);
        parts.push(fixed);

        parts.push(this.packString(this.password_));

        const shorts = Buffer.alloc(8, 0);
        shorts.writeInt16BE(this.channelType_, 0);
        shorts.writeInt16BE(this.connectedUsers_, 2);
        shorts.writeInt16BE(this.openChannels_, 4);
        shorts.writeInt16BE(this.userIsConnected_, 6);
        parts.push(shorts);

        parts.push(this.channelData_);

        const tail = Buffer.alloc(9, 0);
        tail.writeUInt16BE(this.numReadyPlayers_, 0);
        tail.writeUInt16BE(this.maxReadyPlayers_, 2);
        tail.writeUInt32BE(this.channelOwnerId_, 4);
        tail.writeUInt8(this.gameServerIsRunning_, 8);
        parts.push(tail);

        return Buffer.concat(parts);
    }

    set riffName(val: string) { this.riffName_ = val.slice(0, 31); }
    set protocol(val: number) { this.protocol_ = val; }
    set commId(val: number) { this.commId_ = val; }
    set password(val: string) { this.password_ = val.slice(0, 16); }

    set channelType(val: number) { this.channelType_ = val; }
    set connectedUsers(val: number) { this.connectedUsers_ = val; }
    set openChannels(val: number) { this.openChannels_ = val; }
    set userIsConnected(val: boolean) { this.userIsConnected_ = val ? 1 : 0; }

    set channelData(val: Buffer) {
        this.channelData_ = Buffer.alloc(256, 0);
        val.copy(this.channelData_, 0, 0, Math.min(val.length, 256));
    }

    set numReadyPlayers(val: number) { this.numReadyPlayers_ = val; }
    set maxReadyPlayers(val: number) { this.maxReadyPlayers_ = val; }
    set channelOwnerId(val: number) { this.channelOwnerId_ = val; }
    set gameServerIsRunning(val: number) { this.gameServerIsRunning_ = val; }
}

/**
 * NPS_RIFF_LIST packet (opcode 0x0401).
 * Wire format: [NPS header 4B][structSize 4B][numRiffs 4B][NpsRiffInfo × N]
 */
export class NpsRiffListMessage extends BytableMessage {
    private riffs_: NpsRiffInfo[] = [];

    constructor() {
        super(0); // version 0 = 4-byte NPS header [opcode:2][length:2]
    }

    set id(val: number) {
        this.header_.setId(val);
    }

    get id(): number {
        return this.header_.id;
    }

    addRiff(riff: NpsRiffInfo): void {
        this.riffs_.push(riff);
    }

    override get serializeSize(): number {
        const riffsSize = this.riffs_.reduce((s, r) => s + r.serializeSize, 0);
        return this.header_.serializeSize + 8 + riffsSize; // 8 = structSize(4) + numRiffs(4)
    }

    override serialize(): Buffer<ArrayBuffer> {
        this.header_.setMessageLength(this.serializeSize);

        const listHeader = Buffer.alloc(8);
        listHeader.writeUInt32BE(0, 0);                  // structSize = 0
        listHeader.writeUInt32BE(this.riffs_.length, 4); // numRiffs

        return Buffer.concat([
            this.header_.serialize(),
            listHeader,
            ...this.riffs_.map((r) => r.serialize()),
        ]);
    }
}
