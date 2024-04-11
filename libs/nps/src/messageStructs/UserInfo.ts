import type { ISerializable } from "../types.js";

export class UserInfo implements ISerializable {
    private profileId: number; // 4 bytes
    private profileName: string; // 32 bytes - max length
    private userData; // 64 bytes

    constructor(id: number, name: string) {
        if (name.length > 31) {
            throw new Error(
                `Profile name too long: ${name}, max length is 31, got ${name.length}`,
            );
        }
        this.profileId = id;
        this.profileName = name;
        this.userData = Buffer.alloc(64);
    }

    serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        let offset = 0;
        buffer.writeInt32BE(this.profileId, offset);
        offset += 4;
        buffer.writeUInt16BE(this.profileName.length, offset);
        offset += 2;
        buffer.write(
            `${this.profileName}\0`,
            offset,
            this.profileName.length + 1,
            "utf8",
        );
        offset += this.profileName.length + 1;
        this.userData.copy(buffer, offset);
        return buffer;
    }
    deserialize(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getByteSize(): number {
        return 4 + 2 + this.profileName.length + 1 + 64;
    }
    toString(): string {
        return `Profile ID: ${this.profileId}, 
        Profile Name: ${this.profileName}`;
    }
}
