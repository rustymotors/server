import { RoutingServer } from "./src/index";

const router = RoutingServer.getInstance()

import { createServer } from "net";

const server = createServer()
server.on("listening", () => {
  const listeningAddress = server.address()
  if (typeof listeningAddress !== 'string' && listeningAddress !== null && listeningAddress.port !== undefined)
    console.log(`Server is listening on port ${listeningAddress.port}`)
})
server.on("connection", (sock) => {
  sock.on("data", router.handleData)
})
