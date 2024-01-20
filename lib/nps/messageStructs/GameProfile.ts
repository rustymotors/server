import { Message } from "../types.js";
import { putLenBlob, putLenString, putShortBool } from "../utils/purePut.js";
import { getAsHex, getLenBlob, getLenString, getShortBool } from "../utils/pureGet.js";

export class GameProfile implements Message {

    private customerID: number; // 4 bytes
    private profileName: string; // 32 bytes - max length
    private serverId: number; // 4 bytes
    private createStamp: number; // 4 bytes
    private lastLoginStamp: number; // 4 bytes
    private numberGames: number; // 4 bytes
    private profileId: number; // 4 bytes
    private isOnline: boolean; // 2 bytes
    private gamePurchaseStamp: number; // 4 bytes
    private gameSerialNumber: string; // 32 bytes - max length
    private timeOnline: number; // 4 bytes
    private timeInGame: number; // 4 bytes
    private gameBlob: Buffer;  // 512 bytes - max length
    private personalBlob: Buffer; // 256 bytes - max length
    private pictureBlob: Buffer; // 1 byte
    private dnd: boolean; // 2 bytes
    private gameStartStamp: number; // 4 bytes
    private currentKey: string; // 400 bytes - max length
    private profileLevel: number; // 2 bytes
    private shardId: number; // 4 bytes

    constructor() {
        this.customerID = 0;
        this.profileName = "";
        this.serverId = 0;
        this.createStamp = 0;
        this.lastLoginStamp = 0;
        this.numberGames = 0;
        this.profileId = 0;
        this.isOnline = false;
        this.gamePurchaseStamp = 0;
        this.gameSerialNumber = "";
        this.timeOnline = 0;
        this.timeInGame = 0;
        this.gameBlob = Buffer.alloc(0);
        this.personalBlob = Buffer.alloc(0);
        this.pictureBlob = Buffer.alloc(0);
        this.dnd = false;
        this.gameStartStamp = 0;
        this.currentKey = "";
        this.profileLevel = 0;
        this.shardId = 0;
    }

    static new(): GameProfile {
        return new GameProfile();
    }

    static fromBytes(data: Buffer, size: number): GameProfile {
        const message = new GameProfile();
        let offset = 0;
        message.customerID = data.readUInt32BE(offset);
        offset += 4;
        message.profileName = getLenString(data, offset, false);
        offset += message.profileName.length + 2;
        message.serverId = data.readUInt32BE(offset);
        offset += 4;
        message.createStamp = data.readUInt32BE(offset);
        offset += 4;
        message.lastLoginStamp = data.readUInt32BE(offset);
        offset += 4;
        message.numberGames = data.readUInt32BE(offset);
        offset += 4;
        message.profileId = data.readUInt32BE(offset);
        offset += 4;
        message.isOnline = getShortBool(data, offset);
        offset += 2;
        message.gamePurchaseStamp = data.readUInt32BE(offset);
        offset += 4;
        message.gameSerialNumber = getLenString(data, offset, false);
        offset += message.gameSerialNumber.length + 2;
        message.timeOnline = data.readUInt32BE(offset);
        offset += 4;
        message.timeInGame = data.readUInt32BE(offset);
        offset += 4;
        message.gameBlob = getLenBlob(data, offset, false);
        offset += message.gameBlob.length + 2;
        message.personalBlob = getLenBlob(data, offset, false);
        offset += message.personalBlob.length + 2;
        message.pictureBlob = data.subarray(offset, offset + 1);
        offset += message.pictureBlob.length;
        message.dnd = getShortBool(data, offset);
        offset += 2;
        message.gameStartStamp = data.readUInt32BE(offset);
        offset += 4;
        message.currentKey = getLenString(data, offset, false);
        offset += message.currentKey.length + 2;
        message.profileLevel = data.readUInt16BE(offset);
        offset += 2;
        message.shardId = data.readUInt32BE(offset);

        return message;   
    }

    toBytes(): Buffer {
        const buffer = Buffer.alloc(this.getSize());
        let offset = 0;
        buffer.writeUInt32BE(this.customerID, offset);
        offset += 4;
        putLenString(buffer, offset, this.profileName, false);
        offset += this.profileName.length + 2;
        buffer.writeUInt32BE(this.serverId, offset);
        offset += 4;
        buffer.writeUInt32BE(this.createStamp, offset);
        offset += 4;
        buffer.writeUInt32BE(this.lastLoginStamp, offset);
        offset += 4;
        buffer.writeUInt32BE(this.numberGames, offset);
        offset += 4;
        buffer.writeUInt32BE(this.profileId, offset);
        offset += 4;
        putShortBool(buffer, offset, this.isOnline);
        offset += 2;
        buffer.writeUInt32BE(this.gamePurchaseStamp, offset);
        offset += 4;
        putLenString(buffer, offset, this.gameSerialNumber, false);
        offset += this.gameSerialNumber.length + 2;
        buffer.writeUInt32BE(this.timeOnline, offset);
        offset += 4;
        buffer.writeUInt32BE(this.timeInGame, offset);
        offset += 4;
        putLenBlob(buffer, offset, this.gameBlob, false);
        offset += this.gameBlob.length + 4;
        putLenBlob(buffer, offset, this.personalBlob, false);
        offset += this.personalBlob.length + 4;
        buffer.writeUInt8(this.pictureBlob.readUInt8(0), offset);
        offset += 1;
        putShortBool(buffer, offset, this.dnd);
        offset += 2;
        buffer.writeUInt32BE(this.gameStartStamp, offset);
        offset += 4;
        putLenString(buffer, offset, this.currentKey, false);
        offset += this.currentKey.length + 2;
        buffer.writeUInt16BE(this.profileLevel, offset);
        offset += 2;
        buffer.writeUInt32BE(this.shardId, offset);
        offset += 4;
        return buffer;
    }
    toString(): string {
        return `GameProfile: 
        customerID: ${this.customerID}
        profileName: ${this.profileName}
        serverId: ${this.serverId}
        createStamp: ${this.createStamp}
        lastLoginStamp: ${this.lastLoginStamp}
        numberGames: ${this.numberGames}
        profileId: ${this.profileId}
        isOnline: ${this.isOnline}
        gamePurchaseStamp: ${this.gamePurchaseStamp}
        gameSerialNumber: ${this.gameSerialNumber}
        timeOnline: ${this.timeOnline}
        timeInGame: ${this.timeInGame}
        gameBlob: ${this.gameBlob}
        personalBlob: ${this.personalBlob}
        pictureBlob: ${this.pictureBlob}
        dnd: ${this.dnd}
        gameStartStamp: ${this.gameStartStamp}
        currentKey: ${this.currentKey}
        profileLevel: ${this.profileLevel}
        shardId: ${this.shardId}
        `
    }
    toHex(): string {
        return getAsHex(this.toBytes());
    }
    setData(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getData(): Buffer {
        throw new Error("Method not implemented.");
    }
    getSize(): number {
        return 4 + 
        this.profileName.length + 2 +
        4 + 4 + 4 + 4 + 4 + 2 + 4 + 32 + 4 + 4 + 
        this.gameBlob.length + 2 +
        this.personalBlob.length + 2 +
        1 + 2 + 4 + 
        this.currentKey.length + 2 + 
        2 + 4;
    }
}
