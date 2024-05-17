import type { TGateway, TScheduledThread } from "@rustymotors/shared";
import { SubThread, type TServerLogger } from "@rustymotors/shared";

/**
 * @module ConsoleThread
 */

/**
 * Console thread
 */
export class ScheduledThread extends SubThread implements TScheduledThread {
  parentThread: TGateway;
  /**
   * @param {object} options
   * @param {Gateway} options.parentThread The parent thread
   * @param {ServerLogger} options.log The logger
   */
  constructor({
    parentThread,
    log,
  }: {
    parentThread: TGateway | undefined;
    log: TServerLogger;
  }) {
    super("ScheduledThread", log, 100);
    this.log.setName("ScheduledThread");
    if (typeof parentThread === "undefined") {
      throw new Error("parentThread is required when creating ScheduledThread");
    }
    this.parentThread = parentThread;
    this.log.resetName();
  }

  override init() {
    super.init();
    this.log.setName("ScheduledThread:init");
    this.log.info("Scheduled thread initialized");
    this.log.resetName();
  }

  override run() {
    this.log.setName("ScheduledThread:run");
    // Intentionally left blank
    this.log.resetName();
  }

  stop() {
    super.shutdown();
    this.log.setName("ScheduledThread:stop");
    this.log.info("Scheduled thread stopped");
    this.log.resetName();
  }
}
