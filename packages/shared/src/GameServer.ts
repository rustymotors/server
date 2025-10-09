import { CString, checkMinLength, sliceBuff } from "./helpers.js";
import { Serializable } from "./types.js";


export class GameServerLaunchInfo implements Serializable {
    private _commId; // 4
    private _bestHost; // ip - 16

    constructor() {
        this._commId = Buffer.alloc(4);
        this._bestHost = new CString(16);
    }

    get sizeOf() {
        return 4 + this._bestHost.sizeOf;
    };

    serialize() {
        return Buffer.concat([
            this._commId,
            this._bestHost.serialize()
        ]);
    };

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this._commId = sliceBuff(buf, 0, 4);
        this._bestHost.deserialize(buf.subarray(4));
    };

    get commId() {
        return this._commId.readInt32BE();
    }

    get bestHost() {
        return this._bestHost.toString();
    }
}
