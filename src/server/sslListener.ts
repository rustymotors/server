import type { IncomingMessage, ServerResponse } from "http";
import { AuthLogin } from "../auth";
import { AdminServer } from "../admin";
import { logger } from "../logger";

const log = logger.child({ service: "ssl" });

/**
 * Routes incomming SSL requests
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {ServerResponse}
 */
export function sslListener(
  req: IncomingMessage,
  res: ServerResponse
): ServerResponse {
  if (req.url && req.url.startsWith("/AuthLogin")) {
    log.debug("ssl routing request to login web server");
    return AuthLogin.getInstance().handleRequest(req, res);
  }

  if (
    req.url &&
    (req.url === "/admin/connections" ||
      req.url === "/admin/connections/resetAllQueueState" ||
      req.url.startsWith("/admin"))
  ) {
    log.debug("ssl routing request to admin web server");
    return AdminServer.getAdminServer().handleRequest(req, res);
  }

  log.warn(
    `Unexpected request for ${req.url} from ${req.socket.remoteAddress}, skipping.`
  );
  res.statusCode = 404;
  return res.end("Not found");
}
