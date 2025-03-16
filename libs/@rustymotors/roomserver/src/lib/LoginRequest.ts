import { Uint32_t } from "@rustymotors/binary";
import { PacketBody } from "./types.js";

export class LoginRequest implements PacketBody {
    public id: Uint32_t;
    public name: Uint32_t;
    public password: Uint32_t;

    constructor() {
        this.id = new Uint32_t();
        this.name = new Uint32_t();
        this.password = new Uint32_t();
    }

    serialize(): Uint8Array {
        return new Uint8Array([
            ...this.id.get(),
            ...this.name.get(),
            ...this.password.get(),
        ]);
    }

    deserialize(data: Uint8Array): void {
        this.id.set(data.slice(0, 4));
        this.name.set(data.slice(4, 8));
        this.password.set(data.slice(8, 12));
    }

    size(): number {
        return 12;
    }

}
