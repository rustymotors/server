import {
	BinaryMember,
	Uint32_t,
	CString,
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

	swapBytes(v: Uint8Array): Uint8Array {
		const byte0 = v[0] || 0;
		const byte1 = v[1] || 0;
		const byte2 = v[2] || 0;
		const byte3 = v[3] || 0;
		v[0] = byte3;
		v[1] = byte2;
		v[2] = byte1;
		v[3] = byte0;
		return v;
	}

	override get(): Uint8Array {

		return new Uint8Array([
			...this.swapBytes(this._userId.get()),
			...this._userName.get(),
			...this._userData.get(),
		]);
	}

	override size(): number {
		return this._userId.size() + this._userName.size() + this._userData.size();
	}

	get userId(): number {
		return this._userId.getInt("BE");
	}

	get userName(): string	 {
		return this._userName.toString();
	}

	get userData(): UserData {
		return this._userData;
	}

	set userId(value: number) {
		this._userId.setInt(value, "BE");
	}

	set userName(value: CString) {
		this._userName = value;
	}

	set userData(value: UserData) {
		this._userData = value;
	}
}
