// {"level":20,"time":1637665420570,"pid":17640,"hostname":"central-win","service":"mcoserver:DatabaseMgr","msg":"Database initialized"}

export const LOGGING_CLASS = {
  WARNING: {
    name: "warning",
    syslogValue: 4,
    loggableLevels: ["emergency", "alert", "critical"],
  },
};

export class Logger {
  private logLevel: number;
  constructor(serviceName?: string) {
    if (typeof serviceName === "undefined") {
      throw new Error("Error creating logger. No service name was specified.");
    }

    this.logLevel = 6;

    if (typeof process.env.LOG_LEVEL !== "undefined") {
      this.logLevel = Number.parseInt(process.env.LOG_LEVEL);
    }

    if (typeof process.env.LOGGING_LEVEL !== "undefined") {
      this.logLevel = Number.parseInt(process.env.LOGGING_LEVEL);
    }
  }

  static LOGGABLE_LEVEL: Record<string, number> = {
    emergency: 0,
    alert: 1,
    critical: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7,
  };

  /**
   * getLoggableLevels
   */
  static getLoggableLevels(): string[] {
    const returnString = [];

    for (const key of Object.keys(Logger.LOGGABLE_LEVEL)) {
      returnString.push(key);
    }
    return returnString;
  }

  /**
   * getLogLevel
   */
  public getLogLevel(): number {
    return this.logLevel;
  }

  /**
   * log
   */
  public log(level: number, message: string) {
    console.log(`{level: ${level}}, message: ${message}`);
  }
}
