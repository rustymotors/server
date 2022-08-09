/**
 * @class
 */

export class MessageNode implements MessageNode {
    direction: "sent" | "received";
    msgNo: number;
    seq: number;
    flags: number;
    data: Buffer;
    dataLength: number;
    mcoSig: string;
    toFrom: number;
    appId: number;
    rawPacket: Buffer;

    constructor(direction: "sent" | "received") {
        this.direction = direction;
        this.msgNo = 0;
        this.seq = 999;
        this.flags = 0;
        this.data = Buffer.alloc(0);
        this.dataLength = 0;
        this.mcoSig = "NotAValue";

        this.toFrom = 0;
        this.appId = 0;
        this.rawPacket = Buffer.alloc(0);
    }

    deserialize(packet: Buffer): void {
        try {
            this.rawPacket = packet;
            this.dataLength = packet.readInt16LE(0);
            this.mcoSig = packet.slice(2, 6).toString();
            this.seq = packet.readInt16LE(6);
            this.flags = packet.readInt8(10);

            // Data starts at offset 11
            this.data = packet.slice(11);

            // Set message number
            this.msgNo = this.data.readInt16LE(0);
        } catch (err) {
            if (err instanceof Error) {
                if (err.name.includes("RangeError") === true) {
                    // This is likeley not an MCOTS packet, ignore
                    throw new Error(
                        `[MessageNode] Not long enough to deserialize, only ${packet.length.toString()} bytes long`
                    );
                } else {
                    throw new Error(
                        `[MessageNode] Unable to read msgNo from ${packet.toString(
                            "hex"
                        )}: ${err.message}`
                    );
                }
            }
            throw new Error(`Unknown error in deserialize: ${String(err)} `);
        }
    }

    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
        const packet = Buffer.alloc(this.dataLength + 2); // skipcq: JS-0377
        packet.writeInt16LE(this.dataLength, 0);
        packet.write(this.mcoSig, 2);
        packet.writeInt16LE(this.seq, 6);
        packet.writeInt8(this.flags, 10);
        this.data.copy(packet, 11);
        return packet;
    }

    /**
     *
     * @param {number} appId
     * @return {void}
     */
    setAppId(appId: number): void {
        this.appId = appId;
    }

    /**
     *
     * @param {number} newMessageNo
     * @return {void}
     */
    setMsgNo(newMessageNo: number): void {
        this.msgNo = newMessageNo;
        this.data.writeInt16LE(this.msgNo, 0);
    }

    /**
     *
     * @param {number} newSeq
     * @return {void}
     */
    setSeq(newSeq: number): void {
        this.seq = newSeq;
    }

    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    setMsgHeader(packet: Buffer): void {
        const header = Buffer.alloc(6);
        packet.copy(header, 0, 0, 6);
    }

    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    updateBuffer(buffer: Buffer): void {
        this.data = Buffer.from(buffer);
        this.dataLength = buffer.length + 10; // skipcq: JS-0377
        this.msgNo = this.data.readInt16LE(0);
    }

    /**
     *
     * @return {boolean}
     */
    isMCOTS(): boolean {
        return this.mcoSig === "TOMC";
    }

    /**
     *
     * @return {string}
     */
    dumpPacket(): string {
        let packetContentsArray = this.serialize().toString("hex").match(/../g);
        if (packetContentsArray === null) {
            packetContentsArray = [];
        }

        return `Message ${JSON.stringify({
            dataLength: this.dataLength,
            isMCOTS: this.isMCOTS(),
            msgNo: this.msgNo,
            direction: this.direction,
            seq: this.seq,
            flags: this.flags,
            toFrom: this.toFrom,
            appId: this.appId,
            packetContents: packetContentsArray.join(""),
        })}`;
    }

    /**
     * Returns a formatted representation of the packet as a string
     * @returns {string}
     */
    toString(): string {
        return this.dumpPacket();
    }

    /**
     *
     * @return {number}
     */
    getLength(): number {
        return this.dataLength;
    }

    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    BaseMsgHeader(packet: { readInt16LE: (arg0: number) => number }): void {
        // WORD msgNo;
        this.msgNo = packet.readInt16LE(0);
    }
}
