import type { Serializable } from "./types.js";

export class SerializedList<T extends Serializable> implements Serializable {
    private _items: T[];
    private _itemSize: number;

    constructor(itemSize: number) {
        this._itemSize = itemSize;
        this._items = [];
    }

    get sizeOf(): number {
        return this._itemSize * this._items.length + 4
    }

    deserialize(_buf: Buffer) {
        throw ('Not yet Implemented')
    };

    serialize() {
        const itemCountBuffer = Buffer.alloc(4)
        itemCountBuffer.writeInt32BE(this._items.length)
        const itemBuffer = Buffer.alloc(this.sizeOf - 4)
        let offset = 0
        for (const item of this._items) {
            item.serialize().copy(itemBuffer, offset)
            offset += this._itemSize
        }
        return Buffer.concat([
            itemCountBuffer,
            itemBuffer
        ])
    };

    add(item: T) {
        this._items.push(item)
    }
 }
