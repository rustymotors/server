import { APP_CONFIG } from "../config/appconfig";
import { createServer as createHTTPServer, Server as httpServer } from "http";
import { SecureContext } from "tls";
import { logger } from "../logger/index";
import { httpListener } from "./httpListener";

const log = logger.child({ service: "http" });

export interface SSLContext extends SecureContext {
  cert: string;
  honorCipherOrder: boolean;
  key: string;
  rejectUnauthorized: boolean;
}

/**
 * Start the HTTP listener
 * @returns {httpServer}
 */
export function startHTTPListener(): httpServer {
  const { HTTP_LISTEN_HOST, HTTP_EXTERNAL_HOST } = APP_CONFIG.MCOS.SETTINGS;
  log.debug(`Attempting to start the http listener on ${HTTP_LISTEN_HOST}:80`);
  return createHTTPServer(httpListener).listen(80, HTTP_LISTEN_HOST, () => {
    log.debug(
      `http endpoint listening on ${HTTP_LISTEN_HOST}:80 is accessable on ${HTTP_EXTERNAL_HOST}:80`
    );
    log.info("http server is listening...");
  });
}

