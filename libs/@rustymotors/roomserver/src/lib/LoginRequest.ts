import {
	BinaryMember,
	CString,
	Uint32_t,
	Uint8_tArray,
} from "@rustymotors/binary";
import { UserInfo } from "./UserInfo.js";

export class LoginRequest extends BinaryMember {
	private _userInfo: UserInfo = new UserInfo();
	private _customerNumber: Uint32_t = new Uint32_t();
	private _flags: Uint32_t = new Uint32_t();
	private _version: CString = new CString(33);
	private _hostName: CString = new CString(64);
	private _ipAddress: CString = new CString(16);
	private _keyHash: Uint8_tArray = new Uint8_tArray(16);

	override deserialize(v: Uint8Array): void {
		if (v.length > this.size()) {
			throw new Error(
				`LoginRequest must be ${this.size()} bytes long, got ${v.length}`,
			);
		}

		const fields = [
			this._userInfo,
			this._customerNumber,
			this._flags,
			this._version,
			this._hostName,
			this._ipAddress,
			this._keyHash,
		];

		try {
			let offset = 0;

			for (const field of fields) {
				field.set(v.slice(offset, offset + field.size()));
				offset += field.size();
			}
		} catch (error) {
			const e = new Error(
				`Error setting LoginRequest: ${(error as Error).message}`,
			);
			e.cause = error;
			throw e;
		}
	}

	override serialize(): Buffer {
		return Buffer.concat([
			this._userInfo.get(),
			this._customerNumber.get(),
			this._flags.get(),
			this._version.get(),
			this._hostName.get(),
			this._ipAddress.get(),
			this._keyHash.get(),
		]);
	}

	override size(): number {
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

	override toString(): string {
		return `LoginRequest(${this._userInfo}, ${this._customerNumber}, ${this._keyHash}, ${this._hostName}, ${this._ipAddress}, ${this._flags}, ${this._version})`;
	}

	get customerNumber(): number {
		return this._customerNumber.getBE();
	}

	get userInfo(): UserInfo {
		return this._userInfo;
	}
}
