// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;
/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {Buffer} data
 * @property {Buffer} data2
 * @property {string} serviceName
 */

import { MessageNode } from "../../mcos-gateway/src/MessageNode.js";

export class GenericRequestMessage extends MessageNode {
    msgNo;
    data;
    data2;
    serviceName;
    /**
     *
     */
    constructor() {
        super("received");
        this.msgNo = 0;
        this.data = Buffer.alloc(4);
        this.data2 = Buffer.alloc(4);
        this.serviceName = "mcoserver:GenericRequestMsg";
    }

    /**
     *
     * @param {Buffer} buffer
     */
    deserialize(buffer) {
        try {
            this.msgNo = buffer.readInt16LE(0);
        } catch (error) {
            if (error instanceof RangeError) {
                // This is likeley not an MCOTS packet, ignore
            } else {
                throw new TypeError(
                    `[GenericRequestMsg] Unable to read msgNo from ${buffer.toString(
                        "hex"
                    )}: ${String(error)}` // skipcq: JS-0378
                );
            }
        }

        this.data = buffer.slice(2, 6);
        this.data2 = buffer.slice(6);
    }

    /**
     *
     * @return {Buffer}
     */
    serialize() {
        const packet = Buffer.alloc(16);
        packet.writeInt16LE(this.msgNo, 0);
        this.data.copy(packet, 2);
        this.data2.copy(packet, 6);
        return packet;
    }

    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket() {
        return `GenericRequest ${JSON.stringify({
            msgNo: this.msgNo,
            data: this.data.toString("hex"),
            data2: this.data2.toString("hex"),
        })}`;
    }
}
