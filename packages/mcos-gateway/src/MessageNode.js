import { Sentry } from "mcos/shared";

/**
 * @module mcos-gateway
 */

/**
 * @property {"sent" | "received"} direction
 * @property {number} msgNo
 * @property {number} seq
 * @property {number} flags
 * @property {Buffer} data
 * @property {number} dataLength
 * @property {string} mcoSig
 * @property {number} toFrom
 * @property {number} appId
 * @property {Buffer} rawPacket
 */

export class MessageNode {
    direction;
    msgNo;
    seq;
    flags;
    data;
    dataLength;
    mcoSig;
    toFrom;
    appId;
    rawPacket;

    /**
     *
     * @param {"sent" | "received"} direction
     */
    constructor(direction) {
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

    /**
     *
     * @param {Buffer} packet
     */
    deserialize(packet) {
        try {
            this.rawPacket = packet;
            this.dataLength = packet.readInt16LE(0);
            this.mcoSig = packet.subarray(2, 6).toString();
            this.seq = packet.readInt16LE(6);
            this.flags = packet.readInt8(10);

            // Data starts at offset 11
            this.data = packet.slice(11);

            // Set message number
            this.msgNo = this.data.readInt16LE(0);
        } catch (error) {
            if (error instanceof Error) {
                if (error.name.includes("RangeError") === true) {
                    // This is likeley not an MCOTS packet, ignore
                    const err = new Error(
                        `[MessageNode] Not long enough to deserialize, only ${packet.length.toString()} bytes long`
                    );
                    Sentry.addBreadcrumb({
                        level: "error",
                        message: err.message,
                    });
                    throw err;
                } else {
                    const err = new Error(
                        `[MessageNode] Unable to read msgNo from ${packet.toString(
                            "hex"
                        )}: ${error.message}`
                    );
                    Sentry.addBreadcrumb({
                        level: "error",
                        message: err.message,
                    });
                    throw err;
                }
            }
            const err = new Error(
                `Unknown error in deserialize: ${String(error)} `
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw error;
        }
    }

    /**
     *
     * @return {Buffer}
     */
    serialize() {
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
     */
    setAppId(appId) {
        this.appId = appId;
    }

    /**
     *
     * @param {number} newMessageNo
     */
    setMsgNo(newMessageNo) {
        this.msgNo = newMessageNo;
        this.data.writeInt16LE(this.msgNo, 0);
    }

    /**
     *
     * @param {number} newSeq
     */
    setSeq(newSeq) {
        this.seq = newSeq;
    }

    /**
     *
     * @param {Buffer} packet
     */
    setMsgHeader(packet) {
        const header = Buffer.alloc(6);
        packet.copy(header, 0, 0, 6);
    }

    /**
     *
     * @param {Buffer} buffer
     */
    updateBuffer(buffer) {
        this.data = Buffer.from(buffer);
        this.dataLength = buffer.length + 10; // skipcq: JS-0377
        this.msgNo = this.data.readInt16LE(0);
    }

    /**
     *
     * @return {boolean}
     */
    isMCOTS() {
        return this.mcoSig === "TOMC";
    }

    /**
     *
     * @return {string}
     */
    dumpPacket() {
        let packetContentsArray = this.serialize().toString("hex").match(/../g);

        return `Message ${JSON.stringify({
            dataLength: this.dataLength,
            isMCOTS: this.isMCOTS(),
            msgNo: this.msgNo,
            direction: this.direction,
            seq: this.seq,
            flags: this.flags,
            toFrom: this.toFrom,
            appId: this.appId,
            packetContents: (packetContentsArray ?? []).join(""),
        })}`;
    }

    /**
     * Returns a formatted representation of the packet as a string
     * @returns {string}
     */
    toString() {
        return this.dumpPacket();
    }

    /**
     *
     * @return {number}
     */
    getLength() {
        return this.dataLength;
    }

    /**
     *
     * @param {Buffer} packet
     */
    BaseMsgHeader(packet) {
        // WORD msgNo;
        this.msgNo = packet.readInt16LE(0);
    }
}
