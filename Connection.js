
export class Connection {
    /**
     * @memberof Connection
     */
    static INACTIVE = 0;

    /**
     * @memberof Connection
     */
    static ACTIVE = 1;

    /**
     * @memberof Connection
     */
    static CLOSE_PENDING = 2;

    /**
     * @memberof Connection
     */
    static SOFT_KILL = 3;

    constructor() {
        this.id = 0;
        this.appID = 0;
        this.status = Connection.INACTIVE;
        this.socket = 0;
        this.port = 0;
        this.useEncryption = false;
        this.encryprion = null;
        this.ip = "";
    }

}
