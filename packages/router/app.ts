import { createServer } from "net";
import P from "pino";
import { RoutingServer } from "./src/index";

const router = RoutingServer.getInstance();

const log = P().child({ service: "MCOServer:Route" });
log.level = process.env.LOG_LEVEL || "info";

router.start()