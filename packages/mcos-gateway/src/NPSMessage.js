/**
 * @global
 * @typedef {object} NPSMessageJSON
 * @property {number} msgNo
 * @property {number | null} opCode
 * @property { number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {"sent" | "recieved"} direction
 * @property {string | null} sessionKey
 * @property {string} rawBuffer
 */

/**
 * @interface NPSMessage
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {"sent" | "received"} direction
 * @property {string} serviceName
 */
export class NPSMessage {
    msgNo;
    msgVersion;
    reserved;
    content;
    msgLength;
    direction;
    serviceName;
    /**
     *
     * @param {"sent" | "received"} direction - the direction of the message flow
     */
    constructor(direction) {
        throw new Error('not implemented');
    }
    /**
     *
     * @param {Buffer} buffer
     */
    setContent(buffer) {
        throw new Error('not implemented');
    }
    /**
     *
     * @return {Buffer}
     */
    getContentAsBuffer() {
        throw new Error('not implemented');
    }
    /**
     *
     * @return {string}
     */
    getPacketAsString() {
        throw new Error('not implemented');
    }
    /**
     *
     * @return {Buffer}
     */
    serialize() {
        throw new Error('not implemented');
    }
    /**
     *
     * @param {Buffer} packet
     * @return {NPSMessage}
     * @memberof NPSMessage
     */
    deserialize(packet) {
        throw new Error('not implemented');
    }
    /**
     *
     * @param {string} messageType
     * @return {string}
     */
    dumpPacketHeader(messageType) {
        throw new Error('not implemented');
    }
    /**
     * DumpPacket
     * @return {string}
     * @memberof NPSMsg
     */
    dumpPacket() {
        throw new Error('not implemented');
    }
    /**
     *
     * @return {NPSMessageJSON}
     */
    toJSON() {
        throw new Error('not implemented');
    }
}
