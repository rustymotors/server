var config = require('./config.json');
var mcoServer = require('./src/mco-server/index.js')

mcoServer.init()
mcoServer.start(config.server_ports)
