export declare const MC_GET_PLAYER_PHYSICAL = 264;
export declare const MC_GET_PLAYER_INFO = 108;
export declare const MC_GET_BODY_DAMAGE_INFO = 215;
export declare const MC_UPDATE_CACHED_VEHICLE = 163;
export declare const MC_GET_OWNED_VEHICLES = 172;
export declare const MC_GET_COMPLETE_VEHICLE_INFO = 145;
export declare const MC_GET_OWNED_PARTS = 174;
export declare class TpsEntry {
    _mMsgNo: number;
    _mT: Date;
    _mCount: number;
    _mIndex: number;
    _mCounts: Array<number>;
    constructor();
    /**
     * @param {number} value
     */
    set mMsgNo(value: number);
    /**
     * @returns {number}
     * @readonly
     */
    get mMsgNo(): number;
}
export declare function tpsInitializer(): {
    gTps: TpsEntry[];
    gTpsEchoed: TpsEntry[];
};
