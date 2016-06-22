var mcoServer = require('./src/mco_server/index.js')

// port 43300 = MCOTS
var SERVER_PORTS = ['8226', '8228', '7003', '43300']

mcoServer.init()
mcoServer.start(SERVER_PORTS)
