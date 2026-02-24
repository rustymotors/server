import { CString } from "rusty-motors-shared";
import { BaseSerializable } from "./BaseSerializable.js";

export class UserInfo extends BaseSerializable {
    private profileId: number; // 4 bytes
    private _profileName: CString; // 32 bytes - max length
    private userData; // 64 bytes

    constructor(id: number, name: string) {
        super();
        if (name.length > 31) {
            throw new Error(
                `Profile name too long: ${name}, max length is 31, got ${name.length}`,
            );
        }
        this._profileName = new CString(32)
        this.profileId = id;
        this._profileName.set(name)
        this.userData = Buffer.alloc(64);
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        let offset = 0;
        buffer.writeInt32BE(this.profileId, offset);
        offset += 4;
        buffer.writeUInt16BE(this._profileName.length, offset);
        offset += 2;
        this._profileName.serialize().copy(buffer, offset)
        offset += this._profileName.sizeOf
        this.userData.copy(buffer, offset);
        return buffer;
    }
    override getByteSize(): number {
        return 4 + 2 + this._profileName.length + 1 + 64;
    }
    override toString(): string {
        return `Profile ID: ${this.profileId},
        Profile Name: ${this._profileName}`;
    }

    getProfileName() {
        return this._profileName.toString();
    }
}
