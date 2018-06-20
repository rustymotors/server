import { config } from "../config/config";
import Web from "../lib/WebServer";
import mcServer from "./MCServer";

const web = new Web();

web.start(config);

mcServer.run(config);
