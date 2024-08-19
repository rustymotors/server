
import { SubThread, type TGateway, type TServerLogger } from "rusty-motors-shared";
import type { ServerMessage } from "rusty-motors-shared-packets";

export class MessageQueue extends SubThread {
    parentThread: TGateway;

    private _messageQueue: ServerMessage[] = [];

    static _instance: MessageQueue;

    /**
     * @param {object} options
     * @param {Gateway} options.parentThread The parent thread
     * @param {ServerLogger} options.log The logger
     */
    constructor({
        parentThread,
        log,
    }: {
        parentThread: TGateway;
        log: TServerLogger;
    }) {
        super("MessageQueue", log, 100);

        this.log.setName(this.name);
        if (parentThread === undefined) {
            throw new Error(
                `parentThread is undefined when creating ${this.name}`
            );
        }
        this.parentThread = parentThread;

        if (typeof MessageQueue._instance === "undefined") {
            MessageQueue._instance = this;
        }

        this.log.resetName();
    }

    override init() {
        super.init();
        this.log.setName(`${this.name}:init`);
        this.log.info(`${this.name} initialized`);
        this.log.resetName();
    }

    addMessage(message: ServerMessage) {
        this._messageQueue.push(message);
    }

    private popMessage(): ServerMessage | undefined {
        return this._messageQueue.shift();
    }

    override run() {
        this.log.setName(`${this.name}:run`);
        // Intentionally left blank
        this.log.resetName();
    }

    stop() {
        super.shutdown();
        this.log.setName(`${this.name}:stop`);
        this.log.info(`${this.name} stopped`);
        this.log.resetName();
    }
}
