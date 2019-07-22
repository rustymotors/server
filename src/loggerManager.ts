import * as bunyan from "bunyan";
const BunyanToGelfStream = require("bunyan-gelf");

export class Logger {
  public getLogger(service: string) {
    const logger = bunyan
      .createLogger({ name: "mcoServer" })
      .child({ module: service });
    logger.addStream({
      type: "raw",
      stream: new BunyanToGelfStream({
        host: "graylog",
        port: 12201,
      }),
    });

    return logger;
  }
}
