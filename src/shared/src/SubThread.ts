/**
 * @module SubThread
 */

import { EventEmitter } from "node:events";
import type { TServerLogger } from "../index.js";
export class SubThread extends EventEmitter {
  name: string;
  log: TServerLogger;
  loopInterval: number;
  timer: ReturnType<typeof setInterval> | null = null;

  constructor(name: string, log: TServerLogger, loopInterval = 100) {
    super();
    this.name = name;
    this.log = log;
    this.loopInterval = loopInterval;
    this.init();
  }

  init() {
    this.emit("initialized");
    this.timer = setInterval(this.run.bind(this), this.loopInterval);
  }

  run() {
    // Intentionally left blank
  }

  shutdown() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.emit("shutdownComplete");
  }
}
