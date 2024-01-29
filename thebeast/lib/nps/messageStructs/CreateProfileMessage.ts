import { Message } from "../types.js";
import {
    getAsHex,
    getLenBlob,
    getLenString,
    getShortBool,
} from "../utils/pureGet.js";
import { put8, putLenString } from "../utils/purePut.js";

export class CreateProfileMessage implements Message {
    private customerID: number;
    private profileName: string;
    private serverId: number;
    private createStamp: number;
    private lastLoginStamp: number;
    private numberGames: number;
    private profileId: number;
    private isOnline: boolean;
    private gamePurchaseStamp: number;
    private gameSerialNumber: string;
    private timeOnline: number;
    private timeInGame: number;
    private gameBlob: Buffer;
    private personalBlob: Buffer;
    private pictureBlob: Buffer;
    private dnd: boolean;
    private gameStartStamp: number;
    private currentKey: string;
    private profileLevel: number;
    private shardId: number;

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

    static new(): CreateProfileMessage {
        return new CreateProfileMessage();
    }

    static fromBytes(data: Buffer, size: number): CreateProfileMessage {
        const message = new CreateProfileMessage();
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
        const message = Buffer.alloc(0);
        let offset = 0;
        message.writeUInt32BE(this.customerID, offset);
        offset += 4;
        message.write(this.profileName, offset);
        offset += this.profileName.length + 2;
        message.writeUInt32BE(this.serverId, offset);
        offset += 4;
        message.writeUInt32BE(this.createStamp, offset);
        offset += 4;
        message.writeUInt32BE(this.lastLoginStamp, offset);
        offset += 4;
        message.writeUInt32BE(this.numberGames, offset);
        offset += 4;
        message.writeUInt32BE(this.profileId, offset);
        offset += 4;
        message.writeUInt16BE(this.isOnline ? 1 : 0, offset);
        offset += 2;
        message.writeUInt32BE(this.gamePurchaseStamp, offset);
        offset += 4;
        message.write(this.gameSerialNumber, offset);
        offset += this.gameSerialNumber.length + 2;
        message.writeUInt32BE(this.timeOnline, offset);
        offset += 4;
        message.writeUInt32BE(this.timeInGame, offset);
        offset += 4;
        putLenString(message, offset, this.gameBlob.toString(), false);
        offset += this.gameBlob.length + 2;
        putLenString(message, offset, this.personalBlob.toString(), false);
        offset += this.personalBlob.length + 2;
        put8(message, offset, this.pictureBlob.length);
        offset += 1;
        message.writeUInt16BE(this.dnd ? 1 : 0, offset);
        offset += 2;
        message.writeUInt32BE(this.gameStartStamp, offset);
        offset += 4;
        message.write(this.currentKey, offset);
        offset += this.currentKey.length + 2;
        message.writeUInt16BE(this.profileLevel, offset);
        offset += 2;
        message.writeUInt32BE(this.shardId, offset);

        return message;
    }
    toString(): string {
        return `CreateProfileMessage: 
        Customer ID: ${this.customerID}
        Profile Name: ${this.profileName}
        Server ID: ${this.serverId}
        Create Stamp: ${this.createStamp}
        Last Login Stamp: ${this.lastLoginStamp}
        Number Games: ${this.numberGames}
        Profile ID: ${this.profileId}
        Is Online: ${this.isOnline}
        Game Purchase Stamp: ${this.gamePurchaseStamp}
        Game Serial Number: ${this.gameSerialNumber}
        Time Online: ${this.timeOnline}
        Time In Game: ${this.timeInGame}
        Game Blob: ${this.gameBlob}
        Personal Blob: ${this.personalBlob}
        Picture Blob: ${this.pictureBlob}
        DND: ${this.dnd}
        Game Start Stamp: ${this.gameStartStamp}
        Current Key: ${this.currentKey} (length: ${this.currentKey.length})
        Profile Level: ${this.profileLevel}
        Shard ID: ${this.shardId}`;
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
        return this.toBytes().length;
    }
}
