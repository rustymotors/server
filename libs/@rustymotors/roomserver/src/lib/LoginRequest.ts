import { CString, Uint32_t, Uint8_tArray } from "@rustymotors/binary";
import { PacketBody } from "./types.js";
import { UserInfo } from "./UserInfo.js";

export class LoginRequest implements PacketBody {
	private _userInfo: UserInfo = new UserInfo();
	private _customerNumber: Uint32_t = new Uint32_t();
	private _flags: Uint32_t = new Uint32_t();
	private _version: CString = new CString(33);
	private _hostName: CString = new CString(64);
	private _ipAddress: CString = new CString(16);
	private _keyHash: Uint8_tArray = new Uint8_tArray(16);

	deserialize(v: Uint8Array): void {
		if (v.length > this.size()) {
			throw new Error(
				`LoginRequest must be ${this.size()} bytes long, got ${v.length}`,
			);
		}

		try {
			let offset = 0;
			this._userInfo.set(v.slice(0, this._userInfo.size()));
			offset += this._userInfo.size();
			this._customerNumber.set(
				v.slice(offset, offset + this._customerNumber.size()),
			);
			offset += this._customerNumber.size();
            this._flags.set(v.slice(offset, offset + this._flags.size()));
            offset += this._flags.size();
            this._version.set(v.slice(offset, offset + this._version.size()));
            offset += this._version.size();
            this._hostName.set(v.slice(offset, offset + this._hostName.size()));
            offset += this._hostName.size();
            this._ipAddress.set(v.slice(offset, offset + this._ipAddress.size()));
            offset += this._ipAddress.size();
			this._keyHash.set(v.slice(offset, offset + this._keyHash.size()));
            offset += this._keyHash.size();
		} catch (error) {
            const e = new Error(`Error setting LoginRequest: ${(error as Error).message}`);
            e.cause = error;
            throw e;
		}
	}

	serialize(): Uint8Array {
		return new Uint8Array([
			...this._userInfo.get(),
			...this._customerNumber.get(),
            ...this._flags.get(),
            ...this._version.get(),
            ...this._hostName.get(),
            ...this._ipAddress.get(),
            ...this._keyHash.get(),
		]);
	}

	size(): number {
		return (
			this._userInfo.size() +
			this._customerNumber.size() +
            this._flags.size() +
            this._version.size() +
            this._hostName.size() +
            this._ipAddress.size() +
            this._keyHash.size()
		);
	}

	toString(): string {
		return `LoginRequest(${this._userInfo}, ${this._customerNumber}, ${this._keyHash}, ${this._hostName}, ${this._ipAddress}, ${this._flags}, ${this._version})`;
	}

	toHexString(): string {
		return this.serialize().toString();
	}
}
