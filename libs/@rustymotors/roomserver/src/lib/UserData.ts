import { BinaryMember, Uint32_t, Uint8_t, Uint16_t } from "@rustymotors/binary";
import { UserCar } from "./UserCar.js";
import { getServerLogger } from "rusty-motors-shared";

const log = getServerLogger("RoomServer.UserInfo", "roomserver");

export class UserData extends BinaryMember {
	private _carId: UserCar = new UserCar();
	private _lobbyId: Uint32_t = new Uint32_t();
	private _clubId: Uint32_t = new Uint32_t();
	private _isInLobby: Uint8_t = new Uint8_t();
	private _isInTransit: Uint8_t = new Uint8_t();
	private _isInRace: Uint8_t = new Uint8_t();
	private _isValid: Uint8_t = new Uint8_t();
	private _unused: Uint32_t = new Uint32_t();
	private _performance: Uint32_t = new Uint32_t();
	private _points: Uint16_t = new Uint16_t();
	private _level: Uint16_t = new Uint16_t();

	override set(v: Uint8Array): void {
		if (v.length > this.size()) {
			throw new Error(
				`UserData must be ${this.size()} bytes long, got ${v.length}`,
			);
		}

		if (v.length !== this.size()) {
			console.warn(
				"UserData message smaller than expected size",
				"expectedSize",
				this.size(),
				"actualSize",
				v.length,
			);
		}

        let value = v;

		try {
			let offset = 0;
            value = v.slice(offset, offset + this._carId.size());
            this._carId.set(value);
            offset += this._carId.size();
            value = v.slice(offset, offset + this._lobbyId.size());
            this._lobbyId.set(value);
            offset += this._lobbyId.size();
            value = v.slice(offset, offset + this._clubId.size());
            this._clubId.set(value);
            offset += this._clubId.size();
            value = v.slice(offset, offset + this._isInLobby.size());
            this._isInLobby.set(value);
            offset += this._isInLobby.size();
            value = v.slice(offset, offset + this._isInTransit.size());
            this._isInTransit.set(value);
            offset += this._isInTransit.size();
            value = v.slice(offset, offset + this._isInRace.size());
            this._isInRace.set(value);
            offset += this._isInRace.size();
            value = v.slice(offset, offset + this._isValid.size());
            this._isValid.set(value);
            offset += this._isValid.size();
            value = v.slice(offset, offset + this._unused.size());
            this._unused.set(value);
            offset += this._unused.size();
            value = v.slice(offset, offset + this._performance.size());
            this._performance.set(value);
            offset += this._performance.size();
            value = v.slice(offset, offset + this._points.size());
            this._points.set(value);
            offset += this._points.size();
            value = v.slice(offset, offset + this._level.size());
            this._level.set(value);
        } catch (error) {
			log.error(
				{ error, value },
				`Error setting UserData: ${(error as Error).message}`,
			);
			throw error;
		}
	}

	override get(): Uint8Array {
		return new Uint8Array([
			...this._carId.get(),
			...this._lobbyId.get(),
			...this._clubId.get(),
			...this._isInLobby.get(),
			...this._isInTransit.get(),
			...this._isInRace.get(),
			...this._isValid.get(),
			...this._unused.get(),
			...this._performance.get(),
			...this._points.get(),
			...this._level.get(),
		]);
	}

	override size(): number {
		return (
			this._carId.size() +
			this._lobbyId.size() +
			this._clubId.size() +
			this._isInLobby.size() +
			this._isInTransit.size() +
			this._isInRace.size() +
			this._isValid.size() +
			this._unused.size() +
			this._performance.size() +
			this._points.size() +
			this._level.size()
		);
	}
}
