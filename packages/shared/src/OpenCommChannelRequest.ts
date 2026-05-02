import { type Serializable, CString, checkMinLength, sliceBuff } from 'rusty-motors-shared';
import { BytableChannelData } from '@rustymotors/binary';


export class OpenCommChannelRequest implements Serializable {
    private _connectionId; // 4
    private _commId; // 4
    private _protocol; // 4
    private _riffName; // string 32
    private _password; // string 17
    private _channelData; // 256
    private _key; // 4
    private _flags; // 4

    constructor() {
        this._connectionId = Buffer.alloc(4);
        this._commId = Buffer.alloc(4);
        this._protocol = Buffer.alloc(4);
        this._riffName = new CString(32);
        this._password = new CString(17);
        this._channelData = new BytableChannelData();
        this._key = Buffer.alloc(4);
        this._flags = Buffer.alloc(4);
    }

    get sizeOf() {
        return 268 + this._riffName.sizeOf + this._password.sizeOf;
    }

    serialize() {
        return Buffer.concat([
            this._connectionId,
            this._commId,
            this._protocol,
            this._riffName.serialize(),
            this._password.serialize(),
            this._channelData.serialize(),
            this._key,
            this._flags,
        ]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._connectionId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._commId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._protocol = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._riffName.deserialize(buf.subarray(offset));
        offset = offset + this._riffName.sizeOf;
        this._password.deserialize(buf.subarray(offset));
        offset = offset + this._password.sizeOf;
        this._channelData.deserialize(sliceBuff(buf, offset, this._channelData.serializeSize));
        offset = offset + this._channelData.serializeSize;
        this._key = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._flags = sliceBuff(buf, offset, 4);
        offset = offset + 4;
    }

    toString() {
        return JSON.stringify(this);
    }
}
