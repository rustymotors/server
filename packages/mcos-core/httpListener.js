import { AdminServer } from "mcos-admin";
import { AuthLogin } from "mcos-auth";
import { PatchServer } from "mcos-patch";
import { ShardServer } from "mcos-shard";
import { APP_CONFIG } from "mcos-shared/config";
import { logger } from "mcos-shared/logger";

const log = logger.child({ service: "http" });

/**
 * Routes incomming HTTP requests
 * @param {import("node:http").IncomingMessage} req
 * @param {import("node:http").ServerResponse} res
 * @returns {import("node:http").ServerResponse}
 */
export function httpListener(req, res) {
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

  if (
    req.url === "/games/EA_Seattle/MotorCity/UpdateInfo" ||
    req.url === "/games/EA_Seattle/MotorCity/NPS" ||
    req.url === "/games/EA_Seattle/MotorCity/MCO"
  ) {
    log.debug("http routing request to patch server");
    return PatchServer.getInstance(APP_CONFIG).handleRequest(req, res);
  }
  if (
    req.url === "/cert" ||
    req.url === "/key" ||
    req.url === "/registry" ||
    req.url === "/ShardList/"
  ) {
    log.debug("http routing request to shard server");
    return ShardServer.getInstance(APP_CONFIG).handleRequest(req, res);
  }

  log.warn(
    `Unexpected request for ${req.url} from ${req.socket.remoteAddress}, skipping.`
  );
  res.statusCode = 404;
  return res.end("Not found");
}
