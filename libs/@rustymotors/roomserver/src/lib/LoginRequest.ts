import { BinaryMember, CString, Uint32_t, Uint8_tArray } from "@rustymotors/binary";
import { PacketBody } from "./types.js";

// 0100009f000000150000000944722042726f776e0052010000920100005701000005000000a5ceffff0d45acffffffffff00d8ffff0200000000000000ffffffff00000000080000000000000000010000000000000054b46c0000000000000008342e352e302e3000000000106f776e65722d653835636566303364000000000e3139322e3136382e312e31343400d9398e53b5400fbb726cd696581bc409

export class UserInfo extends BinaryMember {
    private _userId: Uint32_t = new Uint32_t();
    private _userName: CString = new CString(32);
    private _userData: Uint8_tArray = new Uint8_tArray(64);

    override set(v: Uint8Array): void {
        if (v.length !== 100) {
            throw new Error("UserInfo must be 100 bytes long");
        }

        this._userId.set(v.slice(0, 4));
        this._userName.set(v.slice(4, 36));
        this._userData.set(v.slice(36, 100));
    }

    override get(): Uint8Array {
        return new Uint8Array([
            ...this._userId.get(),
            ...this._userName.get(),
            ...this._userData.get(),
        ]);
    }

    override size(): number {
        return 100;
    }

    get userId(): Uint32_t {
        return this._userId;
    }

    get userName(): CString {
        return this._userName;
    }

    get userData(): Uint8_tArray {
        return this._userData;
    }

    set userId(value: Uint32_t) {
        this._userId = value;
    }

    set userName(value: CString) {
        this._userName = value;
    }

    set userData(value: Uint8_tArray) {
        this._userData = value;
    }
}

export class LoginRequest implements PacketBody {
    private _userInfo: UserInfo = new UserInfo();
    private _customerNumber: Uint32_t = new Uint32_t();
    private _keyHash: Uint8_tArray = new CString(16);
    private _hostName: CString = new CString(64);
    private _ipAddress: CString = new CString(16);
    private _flags: Uint32_t = new Uint32_t();
    private _version: Uint32_t = new CString(33);

    deserialize(v: Uint8Array): void {
        if (v.length !== 233) {
            throw new Error("LoginRequest must be 233 bytes long");
        }

        this._userInfo.set(v.slice(0, 100));
        this._customerNumber.set(v.slice(100, 104));
        this._keyHash.set(v.slice(104, 120));
        this._hostName.set(v.slice(120, 184));
        this._ipAddress.set(v.slice(184, 200));
        this._flags.set(v.slice(200, 204));
        this._version.set(v.slice(204, 237));
    }

    serialize(): Uint8Array {
        return new Uint8Array([
            ...this._userInfo.get(),
            ...this._customerNumber.get(),
            ...this._keyHash.get(),
            ...this._hostName.get(),
            ...this._ipAddress.get(),
            ...this._flags.get(),
            ...this._version.get(),
        ]);
    }

    size(): number {
        return 233;
    }

    toString(): string {
        return `LoginRequest(${this._userInfo}, ${this._customerNumber}, ${this._keyHash}, ${this._hostName}, ${this._ipAddress}, ${this._flags}, ${this._version})`;
    }

    toHexString(): string {
        return this.serialize().toString();
    }
}
