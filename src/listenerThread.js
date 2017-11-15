const net = require("net");

const listenerPort = process.env.listenerPort;

console.log("Welcome to listener!");

const server = net.createServer(c => {
  // 'connection' listener
  console.log("client connected");
  c.on("end", () => {
    console.log("client disconnected");
    process.send({ msg: "disconnect" }, c);
  });
  c.on("data", data => {
    process.send({ msg: "data", data }, c);
  });
});
server.on("error", err => {
  throw err;
});
server.listen(listenerPort, "0.0.0.0", () => {
  console.log("server bound");
});
