import type { ISerializable } from "../types.js";
import { putLenString } from "../utils/purePut.js";

export class MiniUserInfo implements ISerializable {
    userId: number; // 4 bytes
    userName: string; // 32 bytes - max length

    constructor(userId: number, userName: string) {
        if (userName.length > 32) {
            throw new Error(`User name too long: ${userName}`);
        }

        this.userId = userId;
        this.userName = userName;
    }

    serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        let offset = 0;
        buffer.writeUInt32BE(this.userId, offset);
        offset += 4;
        putLenString(buffer, offset, this.userName, false);
        return buffer;
    }
    deserialize(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getByteSize(): number {
        return 4 + 4 + this.userName.length + 1;
    }
    toString(): string {
        return `MiniUserInfo(userId=${this.userId}, userName=${this.userName})`;
    }
}

export class MiniUserList implements ISerializable {
    private channelId: number; // 4 bytes
    private channelUsers: MiniUserInfo[] = [];

    constructor(channelId: number) {
        this.channelId = channelId;
    }

    addChannelUser(user: MiniUserInfo): void {
        this.channelUsers.push(user);
    }

    serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        let offset = 0;
        buffer.writeUInt32BE(this.channelId, offset);
        offset += 4;
        buffer.writeUInt32BE(this.channelUsers.length, offset);
        offset += 4;
        this.channelUsers.forEach((user) => {
            const userBuffer = user.serialize();
            userBuffer.copy(buffer, offset);
            offset += userBuffer.length;
        });
        return buffer;
    }
    deserialize(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getByteSize(): number {
        return (
            16 +
            this.channelUsers.reduce((acc, user) => acc + user.getByteSize(), 0)
        );
    }
    toString(): string {
        return `MiniUserList(channelId=${this.channelId}, channelUsers=${this.channelUsers})`;
    }
}
