import { APP_CONFIG } from "../config/appconfig";
import { createServer as createHTTPServer, Server as httpServer } from "http";
import { createServer as createSSLServer, Server as sslServer } from "https";
import { logger } from "../logger/index";
import { httpListener } from "./httpListener";
import { sslListener } from "./sslListener";
import { readFileSync } from "fs";

const log = logger.child({ service: "http" });

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

/**
 * Creates an sslOptions object for use with SSL servers
 * @returns {{
  cert: string,
  honorCipherOrder: boolean,
  key: string,
  rejectUnauthorized: boolean
}}
 */
function _sslOptions(): {
  cert: string;
  honorCipherOrder: boolean;
  key: string;
  rejectUnauthorized: boolean;
} {
  log.debug(`Reading ssl certificate...`);

  try {
    const { CERTIFICATE_FILE, PRIVATE_KEY_FILE } = APP_CONFIG.MCOS.CERTIFICATE;
    log.debug(`Loading ${CERTIFICATE_FILE}...`);
    const cert = readFileSync(CERTIFICATE_FILE, {
      encoding: "utf-8",
    });
    log.debug(`Loading ${PRIVATE_KEY_FILE}...`);
    const key = readFileSync(PRIVATE_KEY_FILE, {
      encoding: "utf-8",
    });

    return {
      cert,
      honorCipherOrder: true,
      key,
      rejectUnauthorized: false,
    };
  } catch (error) {
    throw new Error(
      `Error loading ssl configuration files: (${String(
        error
      )}), server must quit!`
    );
  }
}

/**
 * Starts the SSL listener
 * @returns {sslServer}
 */
export function startSSLListener(): sslServer {
  try {
    const { SSL_LISTEN_HOST, SSL_EXTERNAL_HOST } = APP_CONFIG.MCOS.SETTINGS;
    const server = createSSLServer(_sslOptions(), sslListener);
    server.on("tlsClientError", (error: Error) => {
      log.warn(`SSL Socket Client Error: ${error.message}`);
    });
    server.listen(443, SSL_LISTEN_HOST, () => {
      log.debug(
        `ssl endpoint listening on ${SSL_LISTEN_HOST}:443 is accessable on ${SSL_EXTERNAL_HOST}:443`
      );
      log.info("ssl server is listening...");
    });
    return server;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(
        `Unable to start the SSL listener: ${err.message}, ${String(err.stack)}`
      );
    }
    throw new Error(`Unknown Error${String(err)}`);
  }
}
