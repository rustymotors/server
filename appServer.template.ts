import { createServer, Socket } from "net";

const dataHandler = function(sock: Socket): void {
  console.debug(sock.remoteAddress)
}

const server = createServer()
server.on("listening", () => {
  const listeningAddress = server.address()
  if(typeof listeningAddress !== 'string' && listeningAddress !== null && listeningAddress.port !== undefined)
  console.log(`Server is listening on port ${listeningAddress.port}`)
})
server.on("connection", (sock) => {
  sock.on("data", dataHandler)
})
