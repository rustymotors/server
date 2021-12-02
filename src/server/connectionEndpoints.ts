import config from "../config/appconfig";
import { createServer as createHTTPServer, Server as httpServer } from "http";
import { createServer as createSSLServer, Server as sslServer } from "https";
import { logger } from "../logger/index";
import { httpListener } from "./httpListener";
import { sslListener } from "./sslListener";
import { readFileSync } from "fs";

const log = logger.child({ service: "http" });

export function startHTTPListener(): httpServer {
  const { HTTP_LISTEN_HOST, HTTP_EXTERNAL_HOST } = config.MCOS.SETTINGS;
  log.debug(`Attempting to start the http listener on ${HTTP_LISTEN_HOST}:80`);
  return createHTTPServer(httpListener).listen(80, HTTP_LISTEN_HOST, () => {
    log.debug(
      `http endpoint listening on ${HTTP_LISTEN_HOST}:80 is accessable on ${HTTP_EXTERNAL_HOST}:80`
    );
    log.info("http server is listening...");
  });
}

function _sslOptions() {
  log.debug(`Reading ssl certificate...`);

  let cert;
  let key;

  try {
    const { CERTIFICATE_FILE, PRIVATE_KEY_FILE } = config.MCOS.CERTIFICATE;
    log.debug(`Loading ${CERTIFICATE_FILE}...`);
    cert = readFileSync(CERTIFICATE_FILE, {
      encoding: "utf-8",
    });
    log.debug(`Loading ${PRIVATE_KEY_FILE}...`);
    key = readFileSync(PRIVATE_KEY_FILE, {
      encoding: "utf-8",
    });
  } catch (error) {
    throw new Error(
      `Error loading ssl configuration files: (${error}), server must quit!`
    );
  }

  return {
    cert,
    honorCipherOrder: true,
    key,
    rejectUnauthorized: false,
  };
}

export function startSSLListener(): sslServer {
  try {
    const { SSL_LISTEN_HOST, SSL_EXTERNAL_HOST } = config.MCOS.SETTINGS;
    const server = createSSLServer(_sslOptions(), sslListener);
    server.on("tlsClientError", (error) => {
      log.warn(`[AuthLogin] SSL Socket Client Error: ${error.message}`);
    });
    server.listen(443, SSL_LISTEN_HOST, () => {
      log.debug(
        `ssl endpoint listening on ${SSL_LISTEN_HOST}:443 is accessable on ${SSL_EXTERNAL_HOST}:443`
      );
      log.info("ssl server is listening...");
    });
    return server;
  } catch (err) {
    const error = err as Error;
    throw new Error(`${error.message}, ${error.stack}`);
  }
}
