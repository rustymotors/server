import type { TConsoleThread, TGateway } from "@rustymotors/shared";
import {
  SubThread,
  type KeypressEvent,
  type TServerLogger,
} from "@rustymotors/shared";
import { emitKeypressEvents } from "node:readline";

/**
 * @module ConsoleThread
 */

/**
 * Console thread
 */
export class ConsoleThread extends SubThread implements TConsoleThread {
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
    super("ReadInput", log, 100);
    if (typeof parentThread === "undefined") {
      throw new Error("parentThread is undefined when creating ReadInput");
    }
    this.parentThread = parentThread;
  }

  handleKeypressEvent(key: KeypressEvent) {
    const keyString = key.sequence;

    if (keyString === "x") {
      this.emit("userExit");
    }

    if (keyString === "r") {
      this.emit("userRestart");
    }

    if (keyString === "?") {
      this.emit("userHelp");
    }
  }

  override init() {
    super.init();
    emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    this.log.info("GatewayServer started");
    this.log.info("Press x to quit");

    process.stdin.resume();
    process.stdin.on("keypress", (str, key) => {
      if (key !== undefined) {
        this.handleKeypressEvent(key as KeypressEvent);
      }
    });
  }

  override run() {
    // Intentionally left blank
  }

  stop() {
    // Remove all listeners from stdin, preventing further input
    process.stdin.removeAllListeners("keypress");
    process.stdin.pause();
    super.shutdown();
  }
}
