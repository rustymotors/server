import { Bool, checkMinLength, checkSize4, padBuffer, sliceBuff } from "./helpers.js";
import { MCOTSMessage, Serializable } from "./types.js";

export class MessageNodeBody implements Serializable {
    protected body_: Buffer

    constructor() {
        this.body_ = Buffer.alloc(2)
    }

    get sizeOf() {
        return this.body_.byteLength
    }

    serialize() {
        return this.body_
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, 2)
        this.body_ = buf
    };

    get msgNumber() {
        return this.body_.readInt16LE()
    }
}

export class MessageNode implements MCOTSMessage {
    protected connectionId_: string
    protected msgLength_: number // 2
    protected signature_: string // 4
    protected sequence_: number // 4
    protected flags_: number // 1
    protected body_: MessageNodeBody

    constructor() {
        this.connectionId_ = ""
        this.msgLength_ = 0
        this.signature_ = "TOMC"
        this.sequence_ = 0
        this.flags_ = 0
        this.body_ = new MessageNodeBody()
    }

    get sizeOf() {
        return 11 + this.body_.sizeOf
    }

    serialize() {
        checkSize4(this.signature_.length)
        this.msgLength_ = 9 + this.body_.sizeOf
        const buf = Buffer.alloc(this.sizeOf)
        let offset = 0
        buf.writeInt16LE(this.msgLength_, offset)
        offset = offset + 2
        buf.write(this.signature_, offset, "utf8")
        offset = offset + 4
        buf.writeInt32LE(this.sequence_, offset)
        offset = offset + 4
        buf.writeInt8(this.flags_, offset)
        offset = offset + 1
        this.body_.serialize().copy(buf, offset)
        return buf
    };

    deserialize(buf: Buffer) {
        checkMinLength(buf, 11)
        let offset = 0
        this.msgLength_ = buf.readInt16LE(offset)
        offset = offset + 2
        this.signature_ = sliceBuff(buf, offset, 4).toString("utf8")
        offset = offset + 4
        this.sequence_ = buf.readInt32LE(offset)
        offset = offset + 4
        this.flags_ = buf.readInt8(offset)
        offset = offset + 1
        this.body_.deserialize(buf.subarray(offset))

    };

    get connectionId() {
        return this.connectionId_
    }

    set connectionId(val: string) {
        this.connectionId_ = val
    }

    get length() {
        return this.msgLength_
    }

    isSignatureValid() {
        return this.signature_ === "TOMC"
    }

    get signature() {
        return this.signature_
    }

    get sequence() {
        return this.sequence_
    }

    set sequence(val: number) {
        this.sequence_ = val
    }

    isSequenceSet() {
        return this.sequence_ !== 0
    }

    get flags() {
        return this.flags_
    }

    isPayloadEncrypted(): boolean {
        // Does the flags bitmask contain have 0x08 set?
        return (this.flags_ & 0x08) != 0;
    }

    isPayloadCompressed(): boolean {
        return (this.flags_ & 0x02) != 0;
    }

    setPayloadEncryption(encrypted: boolean): void {
        if (encrypted) {
            this.flags_ |= 0x08;
        } else {
            this.flags_ &= ~0x08;
        }
    }

    setPayloadCompression(encrypted: boolean): void {
        if (encrypted) {
            this.flags_ |= 0x02;
        } else {
            this.flags_ &= ~0x02;
        }
    }

    getBody() {
        return this.body_
    }

    setBody(body: MessageNodeBody) {
        this.msgLength_ = body.sizeOf
        this.body_ = body
    };

    get msgNo() {
        return this.body_.msgNumber
    }


    toString() {
        return `seq: ${this.sequence_}, id: ${this.msgNo}`
    }

    // TODO: change usable of these

    /**
     * @deprecated
     * 
     * see {@link signature} and {@link length}
     */
    get header() {
        return {
            length: this.length,
            mcoSig: this.signature
        }
    }

    /**
     * @deprecated
     * 
     * see {@link sequence}
     */
    get seq() {
        return this.sequence
    }

    /**
     * @deprecated
     * 
     * see {@link getBody} and {@link setBody}
     */
    get data() {
        return this.body_.serialize()
    }

    /**
     * @deprecated
     */
    getDataBuffer() {
        return this.body_
    }

    /**
     * @deprecated
     */
    setDataBuffer(val: Buffer) {
        this.body_.deserialize(val)
    }

    /**
     * @deprecated
     */
    getByteSize() {
        return 11 + this.body_.sizeOf
    }

    /**
     * @deprecated
     */
    setSequence(val: number) {
        this.sequence_ = val
    }

    /**
     * @deprecated
     */
    setLength(val: number) {
        this.msgLength_ = val
    }

    /**
     * @deprecated
     */
    setSignature(val: string) {
        this.signature_ = val
    }

    /**
     * @deprecated
     */
    getMessageId() {
        return this.msgNo
    }

    /**
     * @deprecated
     */
    setMessageId(val: number) {
        this.setMessageId(val)
    }

    /**
     * @deprecated
     */
    getLength() {
        return this.msgLength_
    }

    /**
     * @deprecated
     */
    getSignature() {
        return this.signature_
    }

    /**
     * @deprecated
     */
    getSequence() {
        return this.sequence_
    }

    /**
     * @deprecated
     */
    isValidSignature() {
        return this.isSignatureValid()
    }

    /**
     * @deprecated
     */
    ensureValidSignature() {
        if (!this.isSignatureValid()) {
            throw new Error('Signature is not valid')
        }
    }

    /**
 * @deprecated
 */
    ensureNonZeroSequence() {
        if (this.sequence_ === 0) {
            throw new Error('please set sequence')
        }
    }

    /**
 * @deprecated
 */
    get messageId() {
        return this.msgNo
    }

    /**
 * @deprecated
 */
    get messageSource() {
        return null
    }

    /**
 * @deprecated
 */
    get _data() {
        return this.body_
    }

    /**
 * @deprecated
 */
    _assertEnoughData() {
        return false
    }

    /**
 * @deprecated
 */
    _doDeserialize() {

    }

    /**
 * @deprecated
 */

    _doSerialize() { }

    /**
* @deprecated
*/
    toHexString() {
        return this.serialize().toString("hex")
    }

    /**
* @deprecated
*/
    get sequenceNumber() {
        return this.sequence_
    }


}

export class CreateRaceInfo implements Serializable {
    private _minLevel // 4
    private _maxLevel // 4
    private _maxHP // 4
    private _maxRacers // 1
    private _minRacers // 1
    private _numRounds // 1
    private _numLaps // 1
    private _isRaceBackwards // 1
    private _isRaceMirrored // 1
    private _isRaceAtNight // 1
    private _doesRaceHaveWeather // 1
    private _doesRaceHaveDamage // 1
    private _doesRaceHaveTraffic // 1
    private _doesRaceHaveAI // 1
    private _isRaceHandicapped // 1
    private _powerClass  // 4
    private _bodyClass // 4
    private _isNOSDisallowed // 1

    constructor() {
        this._minLevel = Buffer.alloc(4)
        this._maxLevel = Buffer.alloc(4)
        this._maxHP = Buffer.alloc(4)
        this._maxRacers = Buffer.alloc(1)
        this._minRacers = Buffer.alloc(1)
        this._numRounds = Buffer.alloc(1)
        this._numLaps = Buffer.alloc(1)
        this._isRaceBackwards = Buffer.alloc(1)
        this._isRaceMirrored = Buffer.alloc(1)
        this._isRaceAtNight = Buffer.alloc(1)
        this._doesRaceHaveWeather = Buffer.alloc(1)
        this._doesRaceHaveDamage = Buffer.alloc(1)
        this._doesRaceHaveTraffic = Buffer.alloc(1)
        this._doesRaceHaveAI = Buffer.alloc(1)
        this._isRaceHandicapped = Buffer.alloc(1)
        this._powerClass = Buffer.alloc(4)
        this._bodyClass = Buffer.alloc(4)
        this._isNOSDisallowed = Buffer.alloc(1)
    }

    get sizeOf() {
        return 34
    }

    serialize() {
        return padBuffer(Buffer.concat([
            this._minLevel,
            this._maxLevel,
            this._maxHP,
            this._maxRacers,
            this._minRacers,
            this._numRounds,
            this._numLaps,
            this._isRaceBackwards,
            this._isRaceMirrored,
            this._isRaceAtNight,
            this._doesRaceHaveWeather,
            this._doesRaceHaveDamage,
            this._doesRaceHaveTraffic,
            this._doesRaceHaveAI,
            this._isRaceHandicapped,
            this._powerClass,
            this._bodyClass,
            this._isNOSDisallowed
        ]))
    };

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf)
        let offset = 0
        this._minLevel = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._maxLevel= sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._maxHP = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._maxRacers = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._minRacers = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._numRounds = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._numLaps = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._isRaceBackwards = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._isRaceMirrored = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._isRaceAtNight = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._doesRaceHaveWeather = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._doesRaceHaveDamage = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._doesRaceHaveTraffic = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._doesRaceHaveAI = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._isRaceHandicapped = sliceBuff(buf, offset, 1)
        offset = offset + 1
        this._powerClass = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._bodyClass = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._isNOSDisallowed = sliceBuff(buf, offset, 1)
    };

}

export class CreateRaceMessage extends MessageNode {
    private _msgNo // 2
    private _lobbyId // 4
    private _entryFee // 4
    private _isClubRace: Bool // 1
    private _isPinkSlipRace: Bool // 1
    private _isTeamTrial: Bool // 1
    private _sponsorId // 4
    private info: CreateRaceInfo

    constructor() {
        super()
        this._msgNo = Buffer.alloc(4)
        this._lobbyId = Buffer.alloc(4)
        this._entryFee = Buffer.alloc(4)
        this._isClubRace = new Bool()
        this._isPinkSlipRace = new Bool()
        this._isTeamTrial = new Bool()
        this._sponsorId = Buffer.alloc(4)
        this.info = new CreateRaceInfo()
    }

    override get sizeOf() {
        return 2 + 4 + 4 + 1 + 1 + 1 + 4 + this.info.sizeOf
    }

    override serialize() {
        return Buffer.concat([
            this._msgNo,
            this._lobbyId,
            this._entryFee,
            this._isClubRace.serialize(),
            this._isPinkSlipRace.serialize(),
            this._isTeamTrial.serialize(),
            this._sponsorId,
        ])
    };

    override deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf)
        let offset = 0
        this._msgNo = sliceBuff(buf, offset, 2)
        offset = offset + 2
        this._lobbyId = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._entryFee = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this._isClubRace.deserialize(sliceBuff(buf, offset, 1))
        offset + offset + 1
        this._isClubRace.deserialize(sliceBuff(buf, offset, 1))
        offset = offset + 1
        this._isTeamTrial.deserialize(sliceBuff(buf, offset, 1))
        offset = offset + 1
        this._sponsorId = sliceBuff(buf, offset, 4)
        offset = offset + 4
        this.info.deserialize(buf.subarray(offset))
    };
}
