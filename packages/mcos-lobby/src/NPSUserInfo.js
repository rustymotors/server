import { NPSMessage } from "../../mcos-gateway/src/NPSMessage.js";

/**
 * @class NPSUserInfo
 * @extends {NPSMessage}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo extends NPSMessage {
    userId;
    userName;
    userData;
    /**
     *
     * @param {"sent" | "received"} direction
     */
    constructor(direction) {
        super(direction);
        this.userId = 0;
        this.userName = Buffer.from([0x00]); // 30 length
        this.userData = Buffer.from([0x00]); // 64 length
        this.serviceName = "mcoserver:NPSUserInfo";
    }

    /**
     *
     * @override
     * @param {Buffer} rawData
     * @return {NPSUserInfo}
     */
    deserialize(rawData) {
        this.userId = rawData.readInt32BE(4);
        this.userName = rawData.slice(8, 38);
        this.userData = rawData.slice(38);
        return this;
    }

    /**
     * @return {string}
     */
    dumpInfo() {
        let message = this.dumpPacketHeader("NPSUserInfo");
        const { userId, userName, userData } = this;
        const userIdString = userId.toString();
        const userNameString = userName.toString("utf8");
        const userDataStringHex = userData.toString("hex");
        message = message.concat(
            `UserId:        ${userIdString}
         UserName:      ${userNameString}
         UserData:      ${userDataStringHex}
         [/NPSUserInfo]======================================`
        ); // skipcq: JS-0378
        return message;
    }
}
