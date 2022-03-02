import { APP_CONFIG } from "../config/appconfig";
import { IncomingMessage, ServerResponse } from "http";
import { logger } from "../logger";
import { PatchServer } from "../patch";
import { ShardServer } from "../shard";

const log = logger.child({ service: "http" });

/**
 * Routes incomming HTTP requests
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {ServerResponse}
 */
export function httpListener(
  req: IncomingMessage,
  res: ServerResponse
): ServerResponse {
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
    return ShardServer.getInstance(APP_CONFIG)._handleRequest(req, res);
  }

  log.warn(
    `Unexpected request for ${req.url} from ${req.socket.remoteAddress}, skipping.`
  );
  res.statusCode = 404;
  return res.end("Not found");
}
