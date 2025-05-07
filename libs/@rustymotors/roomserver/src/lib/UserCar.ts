import { BinaryMember, Uint32_t } from "@rustymotors/binary";
import { CarDecal } from "./CarDecal.js";

export class UserCar extends BinaryMember {
	private _carId: Uint32_t = new Uint32_t();
	private _brandedPartId: Uint32_t = new Uint32_t();
	private _skinId: Uint32_t = new Uint32_t();
	private _driverModelType: Uint32_t = new Uint32_t();
	private _driverSkinColor: Uint32_t = new Uint32_t();
	private _driverHairColor: Uint32_t = new Uint32_t();
	private _driverShirtColor: Uint32_t = new Uint32_t();
	private _driverPantsColor: Uint32_t = new Uint32_t();
	private _flags: Uint32_t = new Uint32_t();
	private _skinFlags: Uint32_t = new Uint32_t();
	private _decal: CarDecal = new CarDecal();

	override set(v: Uint8Array): void {
		if (v.length > this.size()) {
			throw new Error(
				`UserCar must be ${this.size()} bytes long, got ${v.length}`,
			);
		}

		if (v.length !== this.size()) {
			console.warn(
				"UserCar message smaller than expected size",
				"expectedSize",
				this.size(),
				"actualSize",
				v.length,
			);
		}

		try {
			let offset = 0;
            let value = v.slice(offset, offset + this._carId.size());
            this._carId.set(value);
            offset += this._carId.size();
            value = v.slice(offset, offset + this._brandedPartId.size());
            this._brandedPartId.set(value);
            offset += this._brandedPartId.size();
            value = v.slice(offset, offset + this._skinId.size());
            this._skinId.set(value);
            offset += this._skinId.size();
            value = v.slice(offset, offset + this._driverModelType.size());
            this._driverModelType.set(value);
            offset += this._driverModelType.size();
            value = v.slice(offset, offset + this._driverSkinColor.size());
            this._driverSkinColor.set(value);
            offset += this._driverSkinColor.size();
            value = v.slice(offset, offset + this._driverHairColor.size());
            this._driverHairColor.set(value);
            offset += this._driverHairColor.size();
            value = v.slice(offset, offset + this._driverShirtColor.size());
            this._driverShirtColor.set(value);
            offset += this._driverShirtColor.size();
            value = v.slice(offset, offset + this._driverPantsColor.size());
            this._driverPantsColor.set(value);
            offset += this._driverPantsColor.size();
            value = v.slice(offset, offset + this._flags.size());
            this._flags.set(value);
            offset += this._flags.size();
            value = v.slice(offset, offset + this._skinFlags.size());
            this._skinFlags.set(value);
            offset += this._skinFlags.size();
            value = v.slice(offset, offset + this._decal.size());
            this._decal.set(value);
        } catch (error) {
            const e = new Error(`Error setting UserCar: ${(error as Error).message}`);
            e.cause = error;
            throw e;
		}
	}

	override get(): Uint8Array {
		return new Uint8Array([
			...this._carId.get(),
			...this._brandedPartId.get(),
			...this._skinId.get(),
			...this._driverModelType.get(),
			...this._driverSkinColor.get(),
			...this._driverHairColor.get(),
			...this._driverShirtColor.get(),
			...this._driverPantsColor.get(),
			...this._flags.get(),
			...this._skinFlags.get(),
			...this._decal.get(),
		]);
	}

	override size(): number {
		return (
			this._carId.size() +
			this._brandedPartId.size() +
			this._skinId.size() +
			this._driverModelType.size() +
			this._driverSkinColor.size() +
			this._driverHairColor.size() +
			this._driverShirtColor.size() +
			this._driverPantsColor.size() +
			this._flags.size() +
			this._skinFlags.size() +
			this._decal.size()
		);
	}
}
