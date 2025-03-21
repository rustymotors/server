import {
	BinaryMember,
	Uint32_t,
	CString,
	Uint8_tArray,
} from "@rustymotors/binary";
import { UserData } from "./UserData.js";

export class UserInfo extends BinaryMember {
	private _userId: Uint32_t = new Uint32_t();
	private _userName: CString = new CString(32);
	private _userData: UserData = new UserData();

	override set(v: Uint8Array): void {
		if (v.length > this.size()) {
			throw new Error(
				`UserInfo must be ${this.size()} bytes long, got ${v.length}`,
			);
		}

		if (v.length !== this.size()) {
			console.warn(
				"UserInfo message smaller than expected size",
				"expectedSize",
				this.size(),
				"actualSize",
				v.length,
			);
		}

        let value = v;

		try {
			let offset = 0;
            value = v.slice(offset, offset + this._userId.size());
            this._userId.set(value);
            offset += this._userId.size();
            value = v.slice(offset, offset + this._userName.size());
            this._userName.set(value);
            offset += this._userName.size();
            value = v.slice(offset, offset + this._userData.size());
            this._userData.set(value);
        } catch (error) {
            const e = new Error(`Error setting UserInfo: ${(error as Error).message}`);
            e.cause = error;
            throw e;
		}
	}

	override get(): Uint8Array {
		return new Uint8Array([
			...this._userId.get(),
			...this._userName.get(),
			...this._userData.get(),
		]);
	}

	override size(): number {
		return this._userId.size() + this._userName.size() + this._userData.size();
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
		this._userData.set(value.get());
	}
}
