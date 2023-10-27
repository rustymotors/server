import { privateDecrypt } from "node:crypto";
import { readFileSync } from "node:fs";

import { ServerError } from "../../shared/errors/ServerError.js";
import {
    GameMessage,
    MessageBuffer,
    NPSMessage,
    SerializedBuffer,
    deserializeString,
} from "../../shared/messageFactory.js";
import { getServerLogger } from "../../shared/log.js";
import { State } from "../../shared/State.js";
import { getServerConfiguration } from "../../shared/Configuration.js";
import { off } from "node:process";

/**
 *  An NPSLoginComm packet is 4 structures.
 *
 * Inside a NPSMessage wrapper is a MessageBuffer,
 * followed by a GameMessage with an OpCode of 0x00,
 * and finally another MessageBuffer.
 */
export class LoginRequestMessage extends NPSMessage {
    sessionKey: string;
    contextId: string;
    gameId: string; // this is not a persona id, it is a unique id for the game itself

    private loginBuffer: MessageBuffer;
    private gameMessage: GameMessage;

    constructor() {
        super();
        this.contextId = "";
        this.sessionKey = "";
        this.gameId = "";
        this.loginBuffer = new MessageBuffer();
        this.gameMessage = new GameMessage();
    }

    /**
     * Deserialize the NPSUserStatus packet
     *
     * @param {Buffer} buffer
     * @return {this}
     */
    override deserialize(buffer: Buffer): this {
        try {
            let offset = 0;
            this.id = buffer.readUInt16BE(offset);
            offset += 2; // offset is 2
            this.length = buffer.readUInt16BE(offset);
            offset += 2; // offset is 4
            this.version = buffer.readUInt16BE(offset);
            offset += 4; // offset is 8
            this.reserved = buffer.readUInt16BE(offset);
            offset += 2; // offset is 10
            this.checksum = buffer.readUInt32BE(offset);
            offset += 2; // offset is 12
            this.loginBuffer.deserialize(buffer.subarray(offset));
            offset += this.loginBuffer.size;
            this.gameMessage.deserialize(buffer.subarray(offset));
            offset += this.gameMessage.size;
            this.gameId = buffer
                .subarray(offset + 4, offset + 8)
                .toString("utf8");

            this.contextId = this.loginBuffer.data
                .subarray(0, 34)
                .toString("utf8");

            return this;
        } catch (error) {
            throw new ServerError(
                `Error deserializing LoginRequestMessage: ${String(error)}`,
            );
        }
    }

    /**
     * ExtractSessionKeyFromPacket
     *
     * Take 128 bytes
     * They are the utf-8 of the hex bytes that are the key
     *
     */
    extractSessionKeyFromPacket(rawPacket: Buffer, state: State): void {
        const log = getServerLogger({
            module: "login",
        });
        log.debug("Extracting key");

        // Extract the session key which is 128 acsii characters (256 bytes)
        const sessionKeyAsAscii = rawPacket.subarray(52, 308).toString("utf8");
        log.trace(`Session key: ${sessionKeyAsAscii}`);

        // length of the session key should be 128 bytes
        const sessionkeyString = Buffer.from(sessionKeyAsAscii, "hex");
        // Decrypt the sessionkey
        try {
            const privateKeyPath = getServerConfiguration({}).privateKeyFile;
            const privatekeyContents = readFileSync(privateKeyPath);
            const decrypted = privateDecrypt(
                {
                    key: privatekeyContents,
                },
                sessionkeyString,
            ); // length of decrypted should be 128 bytes
            this.sessionKey = decrypted.subarray(2, -4).toString("hex"); // length of session key should be 12 bytes
        } catch (error) {
            log.trace(`Session key: ${sessionkeyString.toString("utf8")}`); // 128 bytes
            log.trace(`decrypted: ${this.sessionKey}`); // 12 bytes
            log.error(`Error decrypting session key: ${String(error)}`);
            throw new ServerError(
                `Unable to extract session key: ${String(error)}`,
            );
        }
    }

    override get size(): number {
        return 0;
    }

    override serialize(): Buffer {
        throw new ServerError(`Not implemented`);
    }
}
