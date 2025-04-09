import { BinaryMember, Uint8_tArray, Uint8_t } from "@rustymotors/binary";

export class CarDecal extends BinaryMember {
    private _data: Uint8_tArray = new Uint8_tArray(4);

    override set(v: Uint8Array): void {
        if (v.length !== 4) {
            throw new Error(`CarDecal must be 4 bytes long, got ${v.length}`);
        }

        this._data.set(v);
    }

    override get(): Uint8Array {
        return this._data.get();
    }

    override size(): number {
        return this._data.size();
    }

    /**
     * Get the background color of the decal
     * This is the first byte of the decal
     * @returns {Uint8_t}
     */
    get backgroundImage(): Uint8_t {
        const value = this._data.get();
        const returnValue = new Uint8_t();
        returnValue.set(value.slice(0, 1));
        return returnValue;
    }

    /**
     * Get the foreground color of the decal
     * This is the second byte of the decal
     * @returns {Uint8_t}
     */
    get foregroundImage(): Uint8_t {
        const value = this._data.get();
        const returnValue = new Uint8_t();
        returnValue.set(value.slice(1, 2));
        return returnValue;
    }

    /**
     * Get the first color
     * This is the third byte of the decal
     * @returns {Uint8_t}
     */
    get color9(): Uint8_t {
        const value = this._data.get();
        const returnValue = new Uint8_t();
        returnValue.set(value.slice(2, 3));
        return returnValue;
    }

    /**
     * Get the second color
     * This is the fourth byte of the decal
     * @returns {Uint8_t}
     */
    get color1(): Uint8_t {
        const value = this._data.get();
        const returnValue = new Uint8_t();
        returnValue.set(value.slice(3, 4));
        return returnValue;
    }
}
