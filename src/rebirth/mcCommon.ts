export const MC_GET_PLAYER_PHYSICAL = 264;
export const MC_GET_PLAYER_INFO = 108;
export const MC_GET_BODY_DAMAGE_INFO = 215;
export const MC_UPDATE_CACHED_VEHICLE = 163;
export const MC_GET_OWNED_VEHICLES = 172;
export const MC_GET_COMPLETE_VEHICLE_INFO = 145;
export const MC_GET_OWNED_PARTS = 174;

export class TpsEntry {
    _mMsgNo: number;
    _mT: Date;
    _mCount: number;
    _mIndex: number;
    _mCounts: Array<number> = [];
    constructor() {
        this._mMsgNo = 0x00;
        this._mT = new Date();
        this._mCount = 0;

        this._mIndex = 0;
        this._mCounts = [];
        for (let i = 0; i < 10; i++) {
            this._mCounts[i] = 0;
        }
    }

    /**
     * @param {number} value
     */
    set mMsgNo(value) {
        if (value < 0 || value > 9999) {
            throw new Error("Invalid message number");
        }
        this._mMsgNo = value;
    }

    /**
     * @returns {number}
     * @readonly
     */
    get mMsgNo() {
        return this._mMsgNo;
    }
}

export function tpsInitializer() {
    /** @type {TpsEntry[]} */
    const gTps = [];
    for (let i = 0; i < 10000; i++) {
        gTps[i] = new TpsEntry();
    }

    /** @type {TpsEntry[]} */
    const gTpsEchoed = [];
    for (let i = 0; i < 7; i++) {
        gTpsEchoed[i] = new TpsEntry();
    }

    for (let i = 0; i < 10000; i++) {
        gTps[i].mMsgNo = i;
    }

    gTpsEchoed[0] = gTps[MC_GET_PLAYER_PHYSICAL];
    gTpsEchoed[1] = gTps[MC_GET_PLAYER_INFO];
    gTpsEchoed[2] = gTps[MC_GET_BODY_DAMAGE_INFO];
    gTpsEchoed[3] = gTps[MC_UPDATE_CACHED_VEHICLE];
    gTpsEchoed[4] = gTps[MC_GET_OWNED_VEHICLES];
    gTpsEchoed[5] = gTps[MC_GET_COMPLETE_VEHICLE_INFO];
    gTpsEchoed[6] = gTps[MC_GET_OWNED_PARTS];

    return { gTps, gTpsEchoed };
}
