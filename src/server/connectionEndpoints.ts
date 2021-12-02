
import config from "../config/appconfig";
import { createServer, Server } from "http";
import { logger } from "../logger/index";
import { httpListener } from "./httpListener";

const log = logger.child({ service: "http" });

export function startHTTPListeners(): Server {
    const { HTTP_LISTEN_HOST, HTTP_EXTERNAL_HOST} = config.MCOS.SETTINGS
    log.debug(`Attempting to start the http listener on ${HTTP_LISTEN_HOST}:80`);
    return createServer(httpListener).listen( 80, HTTP_LISTEN_HOST , () => {
      log.debug(`http endpoint listening on ${HTTP_LISTEN_HOST}:80 is accessable on ${HTTP_EXTERNAL_HOST}:80`);
      log.info("Shard server is listening...");
    });
  }
