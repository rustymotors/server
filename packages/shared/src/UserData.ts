import type { Serializable, NPSMessage } from './types.js';
import { RawMessageHeader } from './RawMessage.js';
import {
    checkMinLength,
    checkSize2,
    checkSize4,
    CString,
    Long,
    padBuffer,
    setByte,
    sliceBuff,
} from './helpers.js';

// function real2Int(r: number): number {
// 	// C cast to int truncates toward zero; Math.trunc mirrors that behaviour
// 	return Math.trunc(r);
// }

// function real2Fixed(f: number): number {
// 	// REAL2FIXED(x) -> REAL2INT((x)*65536.0f)
// 	return real2Int(f * 65536.0);
// }

export function int2Real(x: number): number {
    return x;
} // INT2REAL
export function fixed2Real(x: number): number {
    return x * (1.0 / 65536.0);
} // FIXED2REAL
export function float2Real(x: number): number {
    return x;
} // FLOAT2REAL
export function real2Float(x: number): number {
    return x;
} // REAL2FLOAT
export function real(x: number): number {
    return x;
} // real()

// Angle / unit helpers
export const RMDEGREE2RAD = 0.01745328; // as in the original macro
export function rmDegree2Real(a: number): number {
    return a * (1.0 / 360.0);
} // RMDEGREE2REAL
export function rmReal2Rad(a: number): number {
    return a * (2.0 * 3.14159265359);
} // RMREAL2RAD
export function rmReal2Degree(a: number): number {
    return a * 360.0;
} // RMREAL2DEGREE

export function floatFrom5Dot3(b: number): number {
    // FLOATFROM5DOT3(b) -> FIXED2REAL(((int)b)<<13)
    // simplifies to b / 8
    return (b & 0xff) / 8;
}

export function floatTo5Dot3(f: number): number {
    // FLOATTO5DOT3(f) -> ((REAL2FIXED(f)>>13)&0xFF)
    // REAL2FIXED(f) ~= Math.trunc(f * 65536) so this simplifies to Math.trunc(f * 8) & 0xFF
    return Math.trunc(f * 8) & 0xff;
}

export class CarDecal implements Serializable {
    private _backgroundImage: Buffer; // byte
    private _forgroundImage: Buffer; // byte
    private _color0: Buffer; // byte
    private _color1: Buffer; // byte

    constructor() {
        this._backgroundImage = Buffer.alloc(1);
        this._forgroundImage = Buffer.alloc(1);
        this._color0 = Buffer.alloc(1);
        this._color1 = Buffer.alloc(1);
    }

    get compressed() {
        return Buffer.concat([
            this._backgroundImage,
            this._forgroundImage,
            this._color0,
            this._color1,
        ]);
    }

    set compressed(val: Buffer) {
        if (val.byteLength !== 4) {
            throw new Error('compressed must be exactly 4 bytes');
        }

        this._backgroundImage = Buffer.from(val.subarray(0, 1));
        this._forgroundImage = Buffer.from(val.subarray(1, 2));
        this._color0 = Buffer.from(val.subarray(2, 3));
        this._color1 = Buffer.from(val.subarray(3, 4));
    }

    get sizeOf() {
        return 4;
    }

    serialize() {
        return this.compressed;
    }

    deserialize(buf: Buffer) {
        if (buf.byteLength !== 4) {
            throw new Error('input must be exactly 4 bytes long');
        }
        this.compressed = buf;
    }
}

export class CarIds implements Serializable {
    private dbCarID; // ulong         // DB part instance (may be zero, if this is just a stock car def)
    private dbBptID; // ulong       // branded part type ID (stock car definitions)
    private dbSkinID; // ulong   // skin ID
    private _driverModelType; // byte
    private _driverSkinColor; // int // 32-bit argb
    private _driverHairColor; // int// 32-bit argb
    private _driverShirtColor; //int  // 32-bit argb
    private _driverPantsColor; // int  // 32-bit argb
    private _flags; // char        // (for multicar) if not 0, force the car to reload, will get reset to 0 when the car starts reloading
    private _skinFlags; // char
    private _CarDecal: CarDecal;

    constructor() {
        this.dbCarID = Buffer.alloc(4);
        this.dbBptID = Buffer.alloc(4);
        this.dbSkinID = Buffer.alloc(4);
        this._driverModelType = Buffer.alloc(1);
        this._driverSkinColor = Buffer.alloc(4);
        this._driverHairColor = Buffer.alloc(4);
        this._driverShirtColor = Buffer.alloc(4);
        this._driverPantsColor = Buffer.alloc(4);
        this._flags = Buffer.alloc(1);
        this._skinFlags = Buffer.alloc(1);
        this._CarDecal = new CarDecal();
    }

    /**
     * Sets the driver model type for the user.
     *
     * @param val - The numeric value representing the driver model type.
     *              This value is processed by the `setByte` function before assignment.
     */
    set driverModelType(val: number) {
        this._driverModelType = setByte(val);
    }

    set skinFlags(val: number) {
        this._skinFlags = setByte(val);
    }

    set flags(val: number) {
        this._flags = setByte(val);
    }

    get sizeOf() {
        return 40;
    }

    serialize() {
        const data = Buffer.concat([
            this.dbCarID,
            this.dbBptID,
            this.dbSkinID,
            padBuffer(this._driverModelType),
            this._driverSkinColor,
            this._driverHairColor,
            this._driverShirtColor,
            this._driverPantsColor,
            padBuffer(Buffer.concat([this._flags, this._skinFlags])),
            this._CarDecal.serialize(),
        ]);

        if (data.byteLength > this.sizeOf) {
            throw new Error(`CarIds exceeds max size!: ${data.byteLength} > ${this.sizeOf}`);
        }

        return data;
    }

    deserialize(buf: Buffer) {
        let offset = 0;
        this.dbCarID = sliceBuff(buf, offset, 4);
        offset += 4;
        this.dbBptID = sliceBuff(buf, offset, 4);
        offset += 4;
        this.dbSkinID = sliceBuff(buf, offset, 4);
        offset += 4;
        this._driverModelType = sliceBuff(buf, offset, 1);
        offset += 4;
        this._driverSkinColor = sliceBuff(buf, offset, 4);
        offset += 4;
        this._driverHairColor = sliceBuff(buf, offset, 4);
        offset += 4;
        this._driverShirtColor = sliceBuff(buf, offset, 4);
        offset += 4;
        this._driverPantsColor = sliceBuff(buf, offset, 4);
        offset += 4;
        this._flags = sliceBuff(buf, offset, 1);
        offset += 1;
        this._skinFlags = sliceBuff(buf, offset, 1);
        offset += 3;
        this._CarDecal.deserialize(
            sliceBuff(buf, offset, this._CarDecal.sizeOf),
        );
    }
}

export class UserData implements Serializable {
    private _carIds: CarIds; //", field: "Structure" },
    private _lobbyId: Buffer; //", field: "Dword" },
    private _clubId: Buffer; //", field: "Dword" },
    private _flags: Buffer; // 1 byte bitfield
    private _performance: Buffer; //", field: "Dword" },
    private _points: Buffer; //", field: "Dword" },
    private _level: Buffer; //", field: "Short" },

    constructor() {
        this._carIds = new CarIds();
        this._lobbyId = Buffer.alloc(4);
        this._clubId = Buffer.alloc(4);
        this._flags = Buffer.alloc(1);
        this._performance = Buffer.alloc(4);
        this._points = Buffer.alloc(4);
        this._level = Buffer.alloc(2);
    }

    get sizeOf() {
        return 64;
    }

    serialize() {
        const data = Buffer.concat([
            this._carIds.serialize(),
            this._lobbyId,
            this._clubId,
            this._flags,
            this._performance,
            this._points,
            this._level,
        ]);

        if (data.byteLength > this.sizeOf) {
            throw new Error(`UserData exceedd max size!`);
        }

        const outBuff = Buffer.alloc(this.sizeOf);
        data.copy(outBuff);
        return outBuff;
    }

    deserialize(buf: Buffer) {
        if (buf.byteLength < 64) {
            throw new Error(`Buffer must be 64 bytes: ${buf.byteLength}`);
        }
        let offset = 0;
        this._carIds.deserialize(buf.subarray(offset));
        offset += this._carIds.sizeOf;
        this._lobbyId = sliceBuff(buf, offset, 4);
        offset += 4;
        this._clubId = sliceBuff(buf, offset, 4);
        offset += 4;
        this._flags = sliceBuff(buf, offset, 1);
        offset += 1;
        this._performance = sliceBuff(buf, offset, 4);
        offset += 4;
        this._points = sliceBuff(buf, offset, 4);
        offset += 4;
        this._level = sliceBuff(buf, offset, 2);
    }

    get lobbyId() {
        return this._lobbyId.readInt32BE();
    }
}

export class UserInfo implements Serializable {
    private _userId: Buffer;
    private _username: CString;
    private _userData: UserData;

    constructor() {
        this._userId = Buffer.alloc(4);
        this._username = new CString(32);
        this._userData = new UserData();
    }

    get sizeOf() {
        return this._userId.byteLength + this._username.sizeOf + this._userData.sizeOf;
    }

    serialize() {
        return Buffer.from(
            Buffer.concat([
                this._userId,
                this._username.serialize(),
                this._userData.serialize(),
            ]),
        );
    }

    deserialize(buf: Buffer) {
        const minSize = 4 + 2 + this._userData.sizeOf;
        if (buf.byteLength < minSize) {
            throw new Error(
                `buffer too small. need ${minSize} bytes, got ${buf.byteLength} bytes`,
            );
        }
        let offset = 0;
        this._userId = sliceBuff(buf, offset, 4);
        offset += 4;
        this._username.deserialize(buf.subarray(offset));
        offset += this._username.sizeOf;
        this._userData.deserialize(sliceBuff(buf, offset, this._userData.sizeOf));
        offset += this._userData.sizeOf;
    }

    get userId() {
        return this._userId.readInt32BE();
    }

    set userId(val: number) {
        checkSize4(val);
        this._userId.writeInt32BE(val);
    }

    get userName() {
        return this._username.toString().trimEnd();
    }

    set userName(val: string) {
        this._username.set(val);
    }

    get userData(): UserData {
        return this._userData;
    }

    set userData(val: UserData) {
        this._userData = val;
    }

    get personaId(): number {
        return this._userId.readInt32BE();
    }

    set personaId(val: number) {
        checkSize4(val);
        this._userId.writeInt32BE(val);
    }

    setUserName(username: string) {
        this._username.set(username);
    }
    getUserName() {
        return this._username.toString();
    }
}

export class UserInfoMessage implements NPSMessage {
    private _header: RawMessageHeader;
    private _userInfo: UserInfo;

    constructor() {
        this._header = new RawMessageHeader();
        this._userInfo = new UserInfo();
    }

    get sizeOf() {
        return this._header.sizeOf + this._userInfo.sizeOf;
    }

    serialize() {
        this._header.length = this.sizeOf
        return Buffer.from(
            Buffer.concat([
                this._header.serialize(),
                this._userInfo.serialize(),
            ]),
        );
    }

    deserialize(buf: Buffer) {
        if (buf.byteLength < this._header.sizeOf) {
            throw new Error(
                `unable to deserialize header, need 4 bytes, got ${buf.byteLength} bytes`,
            );
        }
        let offset = 0;
        this._header.deserialize(sliceBuff(buf, offset, 4));
        offset += 4;
        this._userInfo.deserialize(buf.subarray(offset));
        // Update header length to match actual message size
        this._header.length = buf.byteLength;
    }

    get id() {
        return this._header.id;
    }

    setOpCode(val: number) {
        checkSize2(val)
        this._header.id = val
    }

    get length() {
        return this._header.length;
    }

    get userInfo(): UserInfo {
        return this._userInfo;
    }

    setUserInfo(val: UserInfo) {
        this._userInfo = val
    }

    get header() {
        return this._header
    }
}

const NPS_USERNAME_LEN = 32;

export class UserJoinedChannelMessage implements Serializable {
    private _userName = new CString(NPS_USERNAME_LEN);
    private _userId = new Long();
    private _commId = new Long();
    private _userData = new UserData();
    private _personaId = new Long();

    constructor(
        userName: string,
        userId: number,
        commId: number,
        userData: UserData,
        personaId = 0,
    ) {
        this._userName.set(userName);
        this._userId.value = userId;
        this._commId.value = commId;
        this._userData = userData;
        this._personaId.value = personaId;
    }

    get sizeOf() {
        return (
            this._userName.sizeOf +
            this._userId.sizeOf +
            this._commId.sizeOf +
            this._userData.sizeOf +
            this._personaId.sizeOf
        );
    }

    serialize() {
        return Buffer.concat([
            this._userId.serialize(),
            this._userName.serialize(),
            this._commId.serialize(),
            this._userData.serialize(),
            this._personaId.serialize(),
        ]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._userId.deserialize(sliceBuff(buf, offset, this._userId.sizeOf));
        offset += this._userId.sizeOf;
        this._userName.deserialize(buf.subarray(offset));
        offset += this._userName.sizeOf;
        this._commId.deserialize(sliceBuff(buf, offset, this._commId.sizeOf));
        offset += this._commId.sizeOf;
        this._userData.deserialize(
            sliceBuff(buf, offset, this._userData.sizeOf),
        );
        offset += this._userData.sizeOf;
        this._personaId.deserialize(
            sliceBuff(buf, offset, this._personaId.sizeOf),
        );
    }
}
